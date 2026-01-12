import json
import os
import psycopg2
import hashlib
from datetime import datetime
from quality_gate import (
    build_context_with_scores, 
    quality_gate, 
    compose_system,
    rag_debug_log,
    low_overlap_rate,
    update_low_overlap_stats,
    RAG_TOPK_DEFAULT,
    RAG_TOPK_FALLBACK,
    RAG_LOW_OVERLAP_THRESHOLD,
    RAG_LOW_OVERLAP_START_TOPK5
)

def handler(event: dict, context) -> dict:
    """AI чат с поиском информации в документах"""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
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

        if not user_message:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'message required'}),
                'isBase64Encoded': False
            }

        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()

        # Получаем ai_settings из JSONB для tenant_id=1
        cur.execute("""
            SELECT ai_settings
            FROM t_p56134400_telegram_ai_bot_pdf.tenant_settings
            WHERE tenant_id = 1
        """)
        settings_row = cur.fetchone()
        
        if settings_row and settings_row[0]:
            settings = settings_row[0]
            ai_model = settings.get('model', 'yandexgpt')
            ai_temperature = float(settings.get('temperature', 0.15))
            ai_top_p = float(settings.get('top_p', 1.0))
            ai_frequency_penalty = float(settings.get('frequency_penalty', 0))
            ai_presence_penalty = float(settings.get('presence_penalty', 0))
            ai_max_tokens = int(settings.get('max_tokens', 600))
            ai_system_priority = settings.get('system_priority', 'strict')
            ai_creative_mode = settings.get('creative_mode', 'off')
            embedding_provider = settings.get('embedding_provider', 'openai')
            embedding_model = settings.get('embedding_model', 'text-embedding-3-small')
            system_prompt_template = settings.get('system_prompt', 'Вы - вежливый и профессиональный консьерж отеля. Отвечайте на вопросы гостей, используя только информацию из базы знаний.')
        else:
            ai_model = 'yandexgpt'
            ai_temperature = 0.15
            ai_top_p = 1.0
            ai_frequency_penalty = 0
            ai_presence_penalty = 0
            ai_max_tokens = 600
            ai_system_priority = 'strict'
            ai_creative_mode = 'off'
            embedding_provider = 'openai'
            embedding_model = 'text-embedding-3-small'
            system_prompt_template = 'Вы - вежливый и профессиональный консьерж отеля. Отвечайте на вопросы гостей, используя только информацию из базы знаний.'

        chat_provider = ai_model

        try:
            if embedding_provider == 'yandexgpt':
                import requests
                yandex_api_key = os.environ.get('YANDEXGPT_API_KEY')
                yandex_folder_id = os.environ.get('YANDEXGPT_FOLDER_ID')
                
                emb_response = requests.post(
                    'https://llm.api.cloud.yandex.net/foundationModels/v1/textEmbedding',
                    headers={
                        'Authorization': f'Api-Key {yandex_api_key}',
                        'Content-Type': 'application/json'
                    },
                    json={
                        'modelUri': f'emb://{yandex_folder_id}/{embedding_model}/latest',
                        'text': user_message
                    }
                )
                emb_data = emb_response.json()
                query_embedding = emb_data['embedding']
            else:
                embedding_client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
                query_embedding_response = embedding_client.embeddings.create(
                    model=embedding_model,
                    input=user_message
                )
                query_embedding = query_embedding_response.data[0].embedding
            
            query_embedding_json = json.dumps(query_embedding)

            cur.execute("""
                SELECT chunk_text, embedding_text FROM t_p56134400_telegram_ai_bot_pdf.tenant_chunks 
                WHERE tenant_id = 1 AND embedding_text IS NOT NULL
            """)
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
                print(f"DEBUG: Top 3 chunks for query '{user_message}':")
                for i, (chunk, sim) in enumerate(scored_chunks[:3]):
                    print(f"  {i+1}. Similarity: {sim:.4f}, Text: {chunk[:200]}...")

                request_id = context.request_id if hasattr(context, 'request_id') else 'unknown'
                query_hash = hashlib.sha256(user_message.encode()).hexdigest()[:12]
                
                overlap_rate = low_overlap_rate()
                start_top_k = RAG_TOPK_FALLBACK if (RAG_LOW_OVERLAP_START_TOPK5 and overlap_rate >= RAG_LOW_OVERLAP_THRESHOLD) else RAG_TOPK_DEFAULT
                
                context, sims = build_context_with_scores(scored_chunks, top_k=start_top_k)
                context_ok, gate_reason, gate_debug = quality_gate(user_message, context, sims)
                
                gate_debug['top_k_used'] = start_top_k
                gate_debug['overlap_rate'] = overlap_rate
                
                rag_debug_log({
                    'event': 'rag_gate',
                    'request_id': request_id,
                    'query_hash': query_hash,
                    'timestamp': datetime.utcnow().isoformat(),
                    'attempt': 1,
                    'top_k': start_top_k,
                    'ok': context_ok,
                    'reason': gate_reason,
                    'metrics': gate_debug
                })
                
                if 'low_overlap' in gate_reason and start_top_k < RAG_TOPK_FALLBACK:
                    context2, sims2 = build_context_with_scores(scored_chunks, top_k=RAG_TOPK_FALLBACK)
                    context_ok2, gate_reason2, gate_debug2 = quality_gate(user_message, context2, sims2)
                    
                    gate_debug2['top_k_used'] = RAG_TOPK_FALLBACK
                    gate_debug2['overlap_rate'] = overlap_rate
                    
                    rag_debug_log({
                        'event': 'rag_gate_fallback',
                        'request_id': request_id,
                        'query_hash': query_hash,
                        'timestamp': datetime.utcnow().isoformat(),
                        'attempt': 2,
                        'top_k': RAG_TOPK_FALLBACK,
                        'ok': context_ok2,
                        'reason': gate_reason2,
                        'metrics': gate_debug2
                    })
                    
                    context = context2
                    sims = sims2
                    context_ok = context_ok2
                    gate_reason = gate_reason2
                    gate_debug = gate_debug2
                
                update_low_overlap_stats('low_overlap' in gate_reason)
            else:
                context = ""
                context_ok = False
                gate_reason = "no_chunks"
                sims = []
                gate_debug = {}
        except Exception as emb_error:
            print(f"Embedding search error: {emb_error}")
            cur.execute("""
                SELECT chunk_text FROM t_p56134400_telegram_ai_bot_pdf.document_chunks 
                ORDER BY id DESC 
                LIMIT 3
            """)
            chunks = cur.fetchall()
            context = "\n\n".join([chunk[0] for chunk in chunks]) if chunks else ""
            context_ok = False
            gate_reason = "embedding_error"
            sims = []
            gate_debug = {"error": str(emb_error)}

        cur.execute("""
            INSERT INTO t_p56134400_telegram_ai_bot_pdf.chat_messages (session_id, role, content)
            VALUES (%s, %s, %s)
        """, (session_id, 'user', user_message))
        
        cur.execute("""
            INSERT INTO t_p56134400_telegram_ai_bot_pdf.quality_gate_logs 
            (user_message, context_ok, gate_reason, query_type, lang, 
             best_similarity, context_len, overlap, key_tokens, top_k_used)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user_message,
            context_ok,
            gate_reason,
            gate_debug.get('query_type'),
            gate_debug.get('lang'),
            gate_debug.get('best_similarity'),
            gate_debug.get('context_len'),
            gate_debug.get('overlap'),
            gate_debug.get('key_tokens'),
            gate_debug.get('top_k_used', 3)
        ))
        
        conn.commit()
        
        system_prompt = compose_system(system_prompt_template, context, context_ok)

        if chat_provider == 'yandexgpt':
            import requests
            yandex_api_key = os.environ.get('YANDEXGPT_API_KEY')
            yandex_folder_id = os.environ.get('YANDEXGPT_FOLDER_ID')
            
            completion_options = {
                'temperature': ai_temperature,
                'maxTokens': ai_max_tokens
            }
            
            yandex_response = requests.post(
                'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
                headers={
                    'Authorization': f'Api-Key {yandex_api_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'modelUri': f'gpt://{yandex_folder_id}/yandexgpt/latest',
                    'completionOptions': completion_options,
                    'messages': [
                        {'role': 'system', 'text': system_prompt},
                        {'role': 'user', 'text': user_message}
                    ]
                }
            )
            yandex_data = yandex_response.json()
            assistant_message = yandex_data['result']['alternatives'][0]['message']['text']
        elif chat_provider == 'openai':
            chat_client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
            response = chat_client.chat.completions.create(
                model='gpt-4',
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
            chat_client = OpenAI(
                api_key=os.environ.get('DEEPSEEK_API_KEY'),
                base_url="https://api.deepseek.com"
            )
            response = chat_client.chat.completions.create(
                model='deepseek-chat',
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

        cur.execute("""
            INSERT INTO t_p56134400_telegram_ai_bot_pdf.chat_messages (session_id, role, content)
            VALUES (%s, %s, %s)
        """, (session_id, 'assistant', assistant_message))
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