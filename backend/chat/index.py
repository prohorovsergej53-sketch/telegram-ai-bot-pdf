import json
import os
import sys
import psycopg2
import hashlib
from datetime import datetime

sys.path.append('/function/code')
from timezone_helper import now_moscow, moscow_naive
from api_keys_helper import get_tenant_api_key
from openrouter_models import get_working_free_model
from token_logger import log_token_usage
from system_prompt import DEFAULT_SYSTEM_PROMPT

from quality_gate import (
    build_context_with_scores, 
    quality_gate, 
    compose_system,
    rag_debug_log,
    low_overlap_rate,
    update_low_overlap_stats,
    get_tenant_topk,
    RAG_TOPK_DEFAULT,
    RAG_TOPK_FALLBACK,
    RAG_LOW_OVERLAP_THRESHOLD,
    RAG_LOW_OVERLAP_START_TOPK5
)

def get_provider_and_api_model(frontend_model: str, frontend_provider: str) -> tuple:
    """
    Возвращает (api_model, реальный_провайдер) на основе модели и провайдера с фронта.
    Учитывает, что одна и та же модель (например deepseek-chat) может быть в разных провайдерах.
    Исправлено: убрано дублирование моделей между провайдерами. v2
    """
    mappings = {
        'yandex': {
            'yandexgpt': 'yandexgpt',
            'yandexgpt-lite': 'yandexgpt-lite'
        },
        'deepseek': {
            'deepseek-chat': 'deepseek-chat',
            'deepseek-reasoner': 'deepseek-reasoner'
        },
        'openrouter': {
            # Бесплатные
            'llama-3.3-70b': 'meta-llama/llama-3.3-70b-instruct:free',
            'gemini-2.0-flash': 'google/gemini-2.0-flash-exp:free',
            'deepseek-v3': 'deepseek/deepseek-chat:free',
            'deepseek-r1': 'deepseek/deepseek-r1:free',
            'llama-3.1-405b': 'meta-llama/llama-3.1-405b-instruct:free',
            'qwen-2.5-72b': 'qwen/qwen-2.5-72b-instruct:free',
            'mistral-small': 'mistralai/mistral-small-3.1-24b-instruct:free',
            'phi-3-medium': 'microsoft/phi-3-medium-128k-instruct:free',
            'llama-3.1-8b': 'meta-llama/llama-3.1-8b-instruct:free',
            'gemma-2-9b': 'google/gemma-2-9b-it:free',
            'qwen-2.5-7b': 'qwen/qwen-2.5-7b-instruct:free',
            # Дешевые платные
            'gemini-flash-1.5': 'google/gemini-flash-1.5',
            'deepseek-chat': 'deepseek/deepseek-chat',
            'mixtral-8x7b': 'mistralai/mixtral-8x7b-instruct',
            'claude-3-haiku': 'anthropic/claude-3-haiku',
            'gpt-3.5-turbo': 'openai/gpt-3.5-turbo',
            'llama-3.1-70b': 'meta-llama/llama-3.1-70b-instruct',
            # Топовые платные
            'gemini-pro-1.5': 'google/gemini-pro-1.5',
            'gpt-4o': 'openai/gpt-4o',
            'claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet'
        },
        'proxyapi': {
            'gpt-4o-mini': 'gpt-4o-mini',
            'gpt-3.5-turbo': 'gpt-3.5-turbo',
            'claude-3-haiku': 'claude-3-haiku-20240307',
            'gpt-4o': 'gpt-4o',
            'o1-mini': 'o1-mini',
            'claude-3.5-sonnet': 'claude-3-5-sonnet-20241022',
            'gpt-4-turbo': 'gpt-4-turbo'
        }
    }
    
    if frontend_provider in mappings:
        provider_models = mappings[frontend_provider]
        if frontend_model in provider_models:
            return provider_models[frontend_model], frontend_provider
    
    raise ValueError(f"Model '{frontend_model}' not supported for provider '{frontend_provider}'")

def handler(event: dict, context) -> dict:
    """AI чат с поиском информации в документах отеля (Moscow UTC+3)"""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }

    try:
        from openai import OpenAI
        
        body = json.loads(event.get('body', '{}'))
        user_message = body.get('message', '')
        session_id = body.get('sessionId', 'default')
        tenant_id = body.get('tenantId')
        tenant_slug = body.get('tenantSlug')

        if not user_message:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'message required'}),
                'isBase64Encoded': False
            }

        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        # Если передан slug, получаем tenant_id
        if tenant_slug and not tenant_id:
            cur.execute("""
                SELECT id FROM t_p56134400_telegram_ai_bot_pdf.tenants 
                WHERE slug = %s
            """, (tenant_slug,))
            tenant_row = cur.fetchone()
            if tenant_row:
                tenant_id = tenant_row[0]
                print(f"✅ DEBUG: Resolved tenant_slug '{tenant_slug}' to tenant_id={tenant_id}")
            else:
                tenant_id = 1
                print(f"⚠️ DEBUG: tenant_slug '{tenant_slug}' not found, using tenant_id=1")
        elif not tenant_id:
            tenant_id = 1
            print(f"⚠️ DEBUG: No tenant_slug or tenant_id provided, defaulting to tenant_id=1")

        # Загружаем дефолтный промпт из БД
        cur.execute("""
            SELECT setting_value 
            FROM t_p56134400_telegram_ai_bot_pdf.default_settings 
            WHERE setting_key = 'default_system_prompt'
        """)
        default_prompt_row = cur.fetchone()
        default_prompt_from_db = default_prompt_row[0] if default_prompt_row else DEFAULT_SYSTEM_PROMPT
        
        cur.execute("""
            SELECT ai_settings, embedding_provider, embedding_query_model, quality_gate_settings
            FROM t_p56134400_telegram_ai_bot_pdf.tenant_settings
            WHERE tenant_id = %s
        """, (tenant_id,))
        settings_row = cur.fetchone()
        
        embedding_provider = 'yandex'
        embedding_model = 'text-search-query'
        quality_gate_settings = {}
        tenant_rag_topk_default = RAG_TOPK_DEFAULT
        tenant_rag_topk_fallback = RAG_TOPK_FALLBACK
        
        if settings_row:
            if settings_row[1]:
                embedding_provider = settings_row[1]
            if settings_row[2]:
                embedding_model = settings_row[2]
            if settings_row[3]:
                quality_gate_settings = settings_row[3]
            
            # Читаем tenant-specific RAG top_k настройки из ai_settings
            if settings_row[0]:
                ai_settings_json = settings_row[0]
                if 'rag_topk_default' in ai_settings_json:
                    tenant_rag_topk_default = int(ai_settings_json['rag_topk_default'])
                if 'rag_topk_fallback' in ai_settings_json:
                    tenant_rag_topk_fallback = int(ai_settings_json['rag_topk_fallback'])
                print(f"DEBUG: Tenant {tenant_id} RAG settings: top_k_default={tenant_rag_topk_default}, top_k_fallback={tenant_rag_topk_fallback}")
        
        if settings_row and settings_row[0]:
            settings = settings_row[0]
            ai_model = settings.get('model', 'yandexgpt')
            ai_provider = settings.get('provider', 'yandex')
            
            print(f"DEBUG: Loaded from DB - model={ai_model}, provider={ai_provider}")
            
            # Получаем реальные значения для API
            try:
                chat_api_model, ai_provider = get_provider_and_api_model(ai_model, ai_provider)
                print(f"DEBUG: Mapped to API - model={chat_api_model}, provider={ai_provider}")
            except ValueError as e:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': str(e)}),
                    'isBase64Encoded': False
                }
            # Безопасное преобразование типов (значения могут быть строками из JSON)
            def safe_float(value, default):
                if isinstance(value, (int, float)):
                    return float(value)
                try:
                    return float(value) if value else default
                except (ValueError, TypeError):
                    return default
            
            def safe_int(value, default):
                if isinstance(value, int):
                    return value
                try:
                    return int(float(value)) if value else default
                except (ValueError, TypeError):
                    return default
            
            ai_temperature = safe_float(settings.get('temperature'), 0.7)
            ai_top_p = safe_float(settings.get('top_p'), 0.95)
            ai_frequency_penalty = safe_float(settings.get('frequency_penalty'), 0.0)
            ai_presence_penalty = safe_float(settings.get('presence_penalty'), 0.0)
            ai_max_tokens = safe_int(settings.get('max_tokens'), 1500)
            system_prompt_template = settings.get('system_prompt') or default_prompt_from_db

        try:
            if embedding_provider == 'yandex':
                import requests
                # ВСЕГДА используем PROJECT секреты для эмбеддингов (не tenant ключи!)
                yandex_api_key = os.environ.get('YANDEXGPT_API_KEY')
                yandex_folder_id = os.environ.get('YANDEXGPT_FOLDER_ID')
                
                if not yandex_api_key or not yandex_folder_id:
                    return {
                        'statusCode': 500,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'PROJECT Yandex API keys not configured'}),
                        'isBase64Encoded': False
                    }
                
                print(f"🚀 SENDING TO YANDEX (PROJECT keys): api_key={yandex_api_key[:10]}..., folder_id={yandex_folder_id}")
                
                emb_response = requests.post(
                    'https://llm.api.cloud.yandex.net/foundationModels/v1/textEmbedding',
                    headers={
                        'Authorization': f'Api-Key {yandex_api_key}',
                        'Content-Type': 'application/json'
                    },
                    json={
                        'modelUri': f'emb://{yandex_folder_id}/text-search-query/latest',
                        'text': user_message
                    }
                )
                
                if emb_response.status_code != 200:
                    print(f"Yandex Embedding API error: {emb_response.status_code}, {emb_response.text}")
                    raise Exception(f"Yandex API returned {emb_response.status_code}: {emb_response.text}")
                
                emb_data = emb_response.json()
                print(f"DEBUG: Yandex embedding response keys: {emb_data.keys()}")
                
                if 'embedding' not in emb_data:
                    print(f"ERROR: No 'embedding' in response: {emb_data}")
                    raise Exception(f"Yandex API response missing 'embedding': {emb_data}")
                
                query_embedding = emb_data['embedding']
                
                # Логируем использование токенов для запроса (примерно по количеству символов)
                tokens_estimate = min(len(user_message) // 4, 256)
                log_token_usage(
                    tenant_id=tenant_id,
                    operation_type='embedding_query',
                    model='text-search-query',
                    tokens_used=tokens_estimate,
                    request_id=session_id
                )
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Неизвестный провайдер эмбеддингов: {embedding_provider}'}),
                    'isBase64Encoded': False
                }
            
            query_embedding_json = json.dumps(query_embedding)

            cur.execute("""
                SELECT chunk_text, embedding_text FROM t_p56134400_telegram_ai_bot_pdf.tenant_chunks 
                WHERE tenant_id = %s AND embedding_text IS NOT NULL
            """, (tenant_id,))
            all_chunks = cur.fetchall()

            if all_chunks:
                def cosine_similarity(vec1, vec2):
                    import math
                    dot_product = sum(a * b for a, b in zip(vec1, vec2))
                    magnitude1 = math.sqrt(sum(a * a for a in vec1))
                    magnitude2 = math.sqrt(sum(b * b for b in vec2))
                    if magnitude1 == 0 or magnitude2 == 0:
                        return 0
                    return dot_product / (magnitude1 * magnitude2)

                scored_chunks = []
                for chunk_text, embedding_text in all_chunks:
                    chunk_embedding = json.loads(embedding_text)
                    similarity = cosine_similarity(query_embedding, chunk_embedding)
                    scored_chunks.append((chunk_text, similarity))
                
                scored_chunks.sort(key=lambda x: x[1], reverse=True)
                print(f"DEBUG: Top {tenant_rag_topk_default} chunks for query '{user_message}':")
                for i, (chunk, sim) in enumerate(scored_chunks[:tenant_rag_topk_default]):
                    print(f"  {i+1}. Similarity: {sim:.4f}, Text: {chunk[:200]}...")

                request_id = context.request_id if hasattr(context, 'request_id') else 'unknown'
                query_hash = hashlib.sha256(user_message.encode()).hexdigest()[:12]
                
                overlap_rate = low_overlap_rate()
                start_top_k = tenant_rag_topk_fallback if (RAG_LOW_OVERLAP_START_TOPK5 and overlap_rate >= RAG_LOW_OVERLAP_THRESHOLD) else tenant_rag_topk_default
                
                context_str, sims = build_context_with_scores(scored_chunks, top_k=start_top_k)
                context_ok, gate_reason, gate_debug = quality_gate(user_message, context_str, sims, quality_gate_settings)
                
                gate_debug['top_k_used'] = start_top_k
                gate_debug['overlap_rate'] = overlap_rate
                
                rag_debug_log({
                    'event': 'rag_gate',
                    'request_id': request_id,
                    'query_hash': query_hash,
                    'timestamp': now_moscow().isoformat(),
                    'attempt': 1,
                    'top_k': start_top_k,
                    'ok': context_ok,
                    'reason': gate_reason,
                    'metrics': gate_debug
                })
                
                if 'low_overlap' in gate_reason and start_top_k < tenant_rag_topk_fallback:
                    context2, sims2 = build_context_with_scores(scored_chunks, top_k=tenant_rag_topk_fallback)
                    context_ok2, gate_reason2, gate_debug2 = quality_gate(user_message, context2, sims2, quality_gate_settings)
                    
                    gate_debug2['top_k_used'] = tenant_rag_topk_fallback
                    gate_debug2['overlap_rate'] = overlap_rate
                    
                    rag_debug_log({
                        'event': 'rag_gate_fallback',
                        'request_id': request_id,
                        'query_hash': query_hash,
                        'timestamp': now_moscow().isoformat(),
                        'attempt': 2,
                        'top_k': RAG_TOPK_FALLBACK,
                        'ok': context_ok2,
                        'reason': gate_reason2,
                        'metrics': gate_debug2
                    })
                    
                    context_str = context2
                    sims = sims2
                    context_ok = context_ok2
                    gate_reason = gate_reason2
                    gate_debug = gate_debug2
                
                update_low_overlap_stats('low_overlap' in gate_reason)
            else:
                context_str = ""
                context_ok = False
                gate_reason = "no_chunks"
                sims = []
                gate_debug = {}
        except Exception as emb_error:
            print(f"Embedding search error: {emb_error}")
            cur.execute("""
                SELECT chunk_text FROM t_p56134400_telegram_ai_bot_pdf.tenant_chunks 
                WHERE tenant_id = %s
                ORDER BY id DESC 
                LIMIT 3
            """, (tenant_id,))
            chunks = cur.fetchall()
            context_str = "\n\n".join([chunk[0] for chunk in chunks]) if chunks else ""
            context_ok = False
            gate_reason = "embedding_error"
            sims = []
            gate_debug = {"error": str(emb_error)}

        cur.execute("""
            INSERT INTO t_p56134400_telegram_ai_bot_pdf.chat_messages (session_id, role, content, tenant_id)
            VALUES (%s, %s, %s, %s)
        """, (session_id, 'user', user_message, tenant_id))
        
        cur.execute("""
            INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenant_quality_gate_logs 
            (tenant_id, user_message, context_ok, gate_reason, query_type, lang, 
             best_similarity, context_len, overlap, key_tokens, top_k_used)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            tenant_id,
            user_message,
            context_ok,
            gate_reason,
            gate_debug.get('query_type'),
            gate_debug.get('lang'),
            gate_debug.get('best_similarity'),
            gate_debug.get('context_len'),
            gate_debug.get('overlap'),
            gate_debug.get('key_tokens'),
            gate_debug.get('top_k_used')
        ))
        conn.commit()
        
        system_prompt = compose_system(system_prompt_template, context_str, context_ok)

        if ai_provider == 'yandex':
            yandex_api_key, error = get_tenant_api_key(tenant_id, 'yandex', 'api_key')
            if error:
                return error
            
            yandex_folder_id, error = get_tenant_api_key(tenant_id, 'yandex', 'folder_id')
            if error:
                return error
            
            import requests
            yandex_messages = [
                {"role": "system", "text": system_prompt},
                {"role": "user", "text": user_message}
            ]
            
            payload = {
                "modelUri": f"gpt://{yandex_folder_id}/{chat_api_model}",
                "completionOptions": {
                    "temperature": ai_temperature,
                    "maxTokens": str(ai_max_tokens)
                },
                "messages": yandex_messages
            }
            
            yandex_response = requests.post(
                'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
                headers={
                    'Authorization': f'Api-Key {yandex_api_key}',
                    'Content-Type': 'application/json'
                },
                json=payload
            )
            
            if yandex_response.status_code != 200:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Yandex API error: {yandex_response.text}'}),
                    'isBase64Encoded': False
                }
            
            yandex_data = yandex_response.json()
            assistant_message = yandex_data['result']['alternatives'][0]['message']['text']
        elif ai_provider == 'openrouter':
            openrouter_key, error = get_tenant_api_key(tenant_id, 'openrouter', 'api_key')
            if error:
                return error
            
            is_free_model = chat_api_model.endswith(':free')
            
            if is_free_model:
                try:
                    working_model = get_working_free_model(chat_api_model, openrouter_key)
                    print(f"✅ OpenRouter бесплатная модель доступна: {chat_api_model}")
                except Exception as model_error:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': f'Модель недоступна: {str(model_error)}'}),
                        'isBase64Encoded': False
                    }
            else:
                # Платные модели используем напрямую
                working_model = chat_api_model
                print(f"💰 OpenRouter платная модель: {chat_api_model}")
            
            chat_client = OpenAI(
                api_key=openrouter_key,
                base_url="https://openrouter.ai/api/v1"
            )
            response = chat_client.chat.completions.create(
                model=working_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=ai_temperature,
                top_p=ai_top_p,
                frequency_penalty=ai_frequency_penalty,
                presence_penalty=ai_presence_penalty,
                max_tokens=ai_max_tokens
            )
            assistant_message = response.choices[0].message.content
        elif ai_provider == 'deepseek':
            deepseek_key, error = get_tenant_api_key(tenant_id, 'deepseek', 'api_key')
            if error:
                return error
            chat_client = OpenAI(
                api_key=deepseek_key,
                base_url="https://api.deepseek.com"
            )
            response = chat_client.chat.completions.create(
                model=chat_api_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=ai_temperature,
                top_p=ai_top_p,
                frequency_penalty=ai_frequency_penalty,
                presence_penalty=ai_presence_penalty,
                max_tokens=ai_max_tokens
            )
            assistant_message = response.choices[0].message.content
        elif ai_provider == 'proxyapi':
            proxyapi_key, error = get_tenant_api_key(tenant_id, 'proxyapi', 'api_key')
            if error:
                return error
            chat_client = OpenAI(
                api_key=proxyapi_key,
                base_url="https://api.proxyapi.ru/openai/v1"
            )
            response = chat_client.chat.completions.create(
                model=chat_api_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=ai_temperature,
                top_p=ai_top_p,
                frequency_penalty=ai_frequency_penalty,
                presence_penalty=ai_presence_penalty,
                max_tokens=ai_max_tokens
            )
            assistant_message = response.choices[0].message.content
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Неизвестный провайдер: {ai_provider}'}),
                'isBase64Encoded': False
            }

        cur.execute("""
            INSERT INTO t_p56134400_telegram_ai_bot_pdf.chat_messages (session_id, role, content, tenant_id)
            VALUES (%s, %s, %s, %s)
        """, (session_id, 'assistant', assistant_message, tenant_id))
        conn.commit()

        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': assistant_message,
                'sessionId': session_id,
                'debug': {
                    'context_ok': context_ok,
                    'gate_reason': gate_reason,
                    'gate_info': gate_debug
                }
            }),
            'isBase64Encoded': False
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }