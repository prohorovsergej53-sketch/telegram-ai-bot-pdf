import json
import os
import boto3
import psycopg2
from datetime import datetime
from io import BytesIO
from auth_middleware import get_tenant_id_from_request
import sys
sys.path.append('/function/code')
from api_keys_helper import get_tenant_api_key

def handler(event: dict, context) -> dict:
    """Обработка PDF: извлечение текста, разбиение на чанки и создание эмбеддингов"""
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
        tenant_id, auth_error = get_tenant_id_from_request(event)
        if auth_error:
            return auth_error
        
        import PyPDF2
        from openai import OpenAI
        
        body = json.loads(event.get('body', '{}'))
        document_id = body.get('documentId')

        if not document_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'documentId required'}),
                'isBase64Encoded': False
            }

        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute("SELECT file_key, tenant_id FROM t_p56134400_telegram_ai_bot_pdf.tenant_documents WHERE id = %s AND tenant_id = %s", (document_id, tenant_id))
        result = cur.fetchone()
        
        if not result:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Document not found'}),
                'isBase64Encoded': False
            }

        file_key = result[0]

        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )
        
        obj = s3.get_object(Bucket='files', Key=file_key)
        pdf_data = obj['Body'].read()

        pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_data))
        pages_count = len(pdf_reader.pages)
        
        if pages_count > 20:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'PDF слишком большой: {pages_count} страниц. Максимум: 20 страниц'}),
                'isBase64Encoded': False
            }
        
        full_text = ""
        for page in pdf_reader.pages:
            full_text += page.extract_text() + "\n\n"

        chunk_size = 1000
        chunks = []
        for i in range(0, len(full_text), chunk_size):
            chunk = full_text[i:i + chunk_size]
            if chunk.strip():
                chunks.append(chunk)
        
        if len(chunks) > 2000:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Слишком много текста: {len(chunks)} фрагментов. Максимум: 2000'}),
                'isBase64Encoded': False
            }

        # Получаем настройки эмбеддингов ДО транзакции
        cur.execute("""
            SELECT embedding_provider, embedding_doc_model
            FROM t_p56134400_telegram_ai_bot_pdf.tenant_settings
            WHERE tenant_id = %s
        """, (tenant_id,))
        settings_row = cur.fetchone()
        
        embedding_provider = settings_row[0] if settings_row and settings_row[0] else 'yandex'
        embedding_doc_model = settings_row[1] if settings_row and settings_row[1] else 'text-search-doc'
        
        import requests
        
        # Получаем API ключи ДО транзакции (опционально)
        yandex_api_key = None
        yandex_folder_id = None
        if embedding_provider == 'yandex':
            yandex_api_key, error = get_tenant_api_key(tenant_id, 'yandex', 'api_key')
            if error:
                print(f"No Yandex API key found, skipping embeddings")
                yandex_api_key = None
            else:
                yandex_folder_id, error = get_tenant_api_key(tenant_id, 'yandex', 'folder_id')
                if error:
                    print(f"No Yandex folder_id found, skipping embeddings")
                    yandex_folder_id = None
        
        # Генерируем все эмбеддинги ДО транзакции (если есть API ключи)
        import time
        chunk_embeddings = []
        for idx, chunk_text in enumerate(chunks):
            embedding_json = None
            try:
                if embedding_provider == 'yandex' and yandex_api_key and yandex_folder_id:
                    emb_response = requests.post(
                        'https://llm.api.cloud.yandex.net/foundationModels/v1/textEmbedding',
                        headers={
                            'Authorization': f'Api-Key {yandex_api_key}',
                            'Content-Type': 'application/json'
                        },
                        json={
                            'modelUri': f'emb://{yandex_folder_id}/{embedding_doc_model}/latest',
                            'text': chunk_text
                        },
                        timeout=30
                    )
                    emb_data = emb_response.json()
                    embedding_vector = emb_data['embedding']
                    embedding_json = json.dumps(embedding_vector)
                    
                    if (idx + 1) % 10 == 0:
                        time.sleep(0.5)
                else:
                    if idx == 0:
                        print(f"Embeddings disabled: provider={embedding_provider}, has_key={bool(yandex_api_key)}")
            except Exception as emb_error:
                print(f"Embedding error for chunk {idx}: {emb_error}")
                embedding_json = None
            
            chunk_embeddings.append((chunk_text, embedding_json))

        # АТОМАРНАЯ ТРАНЗАКЦИЯ: удаление старых + вставка новых + обновление статуса
        try:
            cur.execute("BEGIN")
            
            # Удаляем старые чанки
            cur.execute("DELETE FROM t_p56134400_telegram_ai_bot_pdf.document_chunks WHERE document_id = %s", (document_id,))
            cur.execute("DELETE FROM t_p56134400_telegram_ai_bot_pdf.tenant_chunks WHERE document_id = %s", (document_id,))
            
            # Вставляем все новые чанки
            for idx, (chunk_text, embedding_json) in enumerate(chunk_embeddings):
                cur.execute("""
                    INSERT INTO t_p56134400_telegram_ai_bot_pdf.document_chunks 
                    (document_id, chunk_text, chunk_index, embedding_text)
                    VALUES (%s, %s, %s, %s)
                """, (document_id, chunk_text, idx, embedding_json))
                
                cur.execute("""
                    INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenant_chunks 
                    (tenant_id, document_id, chunk_text, chunk_index, embedding_text)
                    VALUES (%s, %s, %s, %s, %s)
                """, (tenant_id, document_id, chunk_text, idx, embedding_json))
            
            # Обновляем статус документа (один раз в конце)
            cur.execute("""
                UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_documents 
                SET status = 'ready', pages = %s, processed_at = %s
                WHERE id = %s
            """, (pages_count, datetime.now(), document_id))
            
            # Один commit в конце всей транзакции
            conn.commit()
            
        except Exception as tx_error:
            conn.rollback()
            raise tx_error
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'documentId': document_id,
                'pages': pages_count,
                'chunks': len(chunks),
                'status': 'ready'
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