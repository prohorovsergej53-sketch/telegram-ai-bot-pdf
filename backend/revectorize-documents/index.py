import json
import os
import psycopg2
import requests
from auth_middleware import get_tenant_id_from_request
from openai import OpenAI

def get_embedding_config(model: str) -> dict:
    """Получить конфигурацию эмбеддингов для модели"""
    configs = {
        'yandexgpt': {
            'provider': 'yandex',
            'doc_model': 'text-search-doc/latest',
            'dimension': 256
        },
        'openai': {
            'provider': 'openai',
            'doc_model': 'text-embedding-3-small',
            'dimension': 1536
        },
        'openrouter': {
            'provider': 'openai',
            'doc_model': 'text-embedding-3-small',
            'dimension': 1536
        }
    }
    return configs.get(model, configs['yandexgpt'])


def get_embedding(text: str, provider: str, model: str) -> list:
    """Получить эмбеддинг для текста"""
    if provider == 'yandex':
        yandex_api_key = os.environ.get('YANDEXGPT_API_KEY')
        yandex_folder_id = os.environ.get('YANDEXGPT_FOLDER_ID')
        
        response = requests.post(
            'https://llm.api.cloud.yandex.net/foundationModels/v1/textEmbedding',
            headers={
                'Authorization': f'Api-Key {yandex_api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'modelUri': f'emb://{yandex_folder_id}/{model}',
                'text': text
            },
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        return data['embedding']
    else:  # OpenAI
        client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
        response = client.embeddings.create(
            model=model,
            input=text
        )
        return response.data[0].embedding


def revectorize_documents(conn, cur, tenant_id: int, new_model: str, total_docs: int):
    """Полная ревекторизация документов для tenant"""
    config = get_embedding_config(new_model)
    provider = config['provider']
    doc_model = config['doc_model']
    
    # Обновить embedding_provider и embedding_model в tenant_settings
    cur.execute("""
        UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
        SET ai_settings = jsonb_set(
            jsonb_set(
                COALESCE(ai_settings, '{}'::jsonb),
                '{embedding_provider}',
                %s::jsonb
            ),
            '{embedding_model}',
            %s::jsonb
        )
        WHERE tenant_id = %s
    """, (json.dumps(provider), json.dumps(doc_model), tenant_id))
    conn.commit()
    
    # Получить все чанки документов для tenant
    cur.execute("""
        SELECT id, chunk_text, document_id
        FROM t_p56134400_telegram_ai_bot_pdf.tenant_chunks
        WHERE tenant_id = %s
        ORDER BY document_id, chunk_index
    """, (tenant_id,))
    
    chunks = cur.fetchall()
    total_chunks = len(chunks)
    processed_chunks = 0
    current_doc_id = None
    docs_processed = 0
    
    for chunk_id, chunk_text, doc_id in chunks:
        # Отслеживание прогресса по документам
        if doc_id != current_doc_id:
            current_doc_id = doc_id
            docs_processed += 1
            
            # Обновить прогресс каждые N документов
            if docs_processed % max(1, total_docs // 10) == 0:
                cur.execute("""
                    UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
                    SET revectorization_progress = %s
                    WHERE tenant_id = %s
                """, (docs_processed, tenant_id))
                conn.commit()
        
        # Получить новый эмбеддинг
        try:
            embedding_vector = get_embedding(chunk_text, provider, doc_model)
            embedding_json = json.dumps(embedding_vector)
            
            # Обновить эмбеддинг в базе
            cur.execute("""
                UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_chunks
                SET embedding_text = %s
                WHERE id = %s
            """, (embedding_json, chunk_id))
            
            # Также обновить в document_chunks
            cur.execute("""
                UPDATE t_p56134400_telegram_ai_bot_pdf.document_chunks
                SET embedding_text = %s
                WHERE document_id = %s AND chunk_text = %s
            """, (embedding_json, doc_id, chunk_text))
            
            processed_chunks += 1
            
            # Коммитим каждые 10 чанков для надёжности
            if processed_chunks % 10 == 0:
                conn.commit()
                
        except Exception as emb_error:
            print(f"Error embedding chunk {chunk_id}: {emb_error}")
            raise emb_error
    
    # Финальный коммит
    conn.commit()


def handler(event: dict, context) -> dict:
    """Ревекторизация документов при смене AI модели"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }

    try:
        tenant_id, auth_error = get_tenant_id_from_request(event)
        if auth_error:
            return auth_error

        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()

        if method == 'GET':
            # Получить статус ревекторизации
            cur.execute("""
                SELECT 
                    revectorization_status,
                    revectorization_progress,
                    revectorization_total,
                    revectorization_error
                FROM t_p56134400_telegram_ai_bot_pdf.tenant_settings
                WHERE tenant_id = %s
            """, (tenant_id,))
            row = cur.fetchone()
            
            status = 'idle'
            progress = 0
            total = 0
            error = None
            
            if row and row[0]:
                status = row[0]
                progress = row[1] or 0
                total = row[2] or 0
                error = row[3]

            cur.close()
            conn.close()

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'status': status,
                    'progress': progress,
                    'total': total,
                    'error': error
                }),
                'isBase64Encoded': False
            }

        elif method == 'POST':
            # Запустить ревекторизацию
            body = json.loads(event.get('body', '{}'))
            new_model = body.get('model')
            
            if not new_model:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'model required'}),
                    'isBase64Encoded': False
                }

            # Подсчитать количество документов
            cur.execute("""
                SELECT COUNT(*) 
                FROM t_p56134400_telegram_ai_bot_pdf.documents
                WHERE tenant_id = %s AND status = 'processed'
            """, (tenant_id,))
            total_docs = cur.fetchone()[0]

            if total_docs == 0:
                cur.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'status': 'completed',
                        'message': 'No documents to revectorize'
                    }),
                    'isBase64Encoded': False
                }

            # Установить статус "в процессе"
            cur.execute("""
                UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
                SET revectorization_status = 'processing',
                    revectorization_progress = 0,
                    revectorization_total = %s,
                    revectorization_error = NULL,
                    revectorization_model = %s
                WHERE tenant_id = %s
            """, (total_docs, new_model, tenant_id))
            conn.commit()

            # Запустить полноценную ревекторизацию
            try:
                revectorize_documents(conn, cur, tenant_id, new_model, total_docs)
                
                # Установить статус "завершено"
                cur.execute("""
                    UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
                    SET revectorization_status = 'completed',
                        revectorization_progress = %s,
                        revectorization_error = NULL
                    WHERE tenant_id = %s
                """, (total_docs, tenant_id))
                conn.commit()
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'status': 'completed',
                        'total': total_docs,
                        'message': f'Revectorization completed for {total_docs} documents'
                    }),
                    'isBase64Encoded': False
                }
            except Exception as revec_error:
                # Установить статус "ошибка"
                cur.execute("""
                    UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
                    SET revectorization_status = 'error',
                        revectorization_error = %s
                    WHERE tenant_id = %s
                """, (str(revec_error), tenant_id))
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'status': 'error',
                        'error': str(revec_error)
                    }),
                    'isBase64Encoded': False
                }

        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }