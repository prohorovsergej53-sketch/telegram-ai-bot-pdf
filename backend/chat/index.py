import json
import os
import psycopg2
from datetime import datetime
from quality_gate import build_context_with_scores, quality_gate, compose_system

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

        cur.execute("""
            SELECT model, temperature, top_p, frequency_penalty, 
                   presence_penalty, max_tokens, system_priority, creative_mode
            FROM t_p56134400_telegram_ai_bot_pdf.ai_model_settings
            LIMIT 1
        """)
        model_row = cur.fetchone()
        
        if model_row:
            ai_model = model_row[0]
            ai_temperature = float(model_row[1])
            ai_top_p = float(model_row[2])
            ai_frequency_penalty = float(model_row[3])
            ai_presence_penalty = float(model_row[4])
            ai_max_tokens = int(model_row[5])
            ai_system_priority = model_row[6]
            ai_creative_mode = model_row[7]
        else:
            ai_model = 'yandexgpt'
            ai_temperature = 0.15
            ai_top_p = 1.0
            ai_frequency_penalty = 0
            ai_presence_penalty = 0
            ai_max_tokens = 600
            ai_system_priority = 'strict'
            ai_creative_mode = 'off'

        cur.execute("""
            SELECT setting_key, setting_value 
            FROM t_p56134400_telegram_ai_bot_pdf.ai_settings
        """)
        settings_rows = cur.fetchall()
        settings = {row[0]: row[1] for row in settings_rows}

        chat_provider = ai_model
        embedding_provider = settings.get('embedding_provider', 'openai')
        embedding_model = settings.get('embedding_model', 'text-embedding-3-small')
        system_prompt_template = settings.get('system_prompt', 'Вы - вежливый и профессиональный консьерж отеля. Отвечайте на вопросы гостей, используя только информацию из базы знаний.')

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
                SELECT chunk_text, embedding_text FROM t_p56134400_telegram_ai_bot_pdf.document_chunks 
                WHERE embedding_text IS NOT NULL
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

                context, sims = build_context_with_scores(scored_chunks, top_k=3)
                context_ok, gate_reason, gate_debug = quality_gate(user_message, context, sims)
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