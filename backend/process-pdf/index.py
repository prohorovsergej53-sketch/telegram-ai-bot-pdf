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
    """Обработка PDF: извлечение текста и разбиение на чанки"""
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
        
        cur.execute("SELECT file_key, tenant_id FROM t_p56134400_telegram_ai_bot_pdf.documents WHERE id = %s AND tenant_id = %s", (document_id, tenant_id))
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
        
        full_text = ""
        for page in pdf_reader.pages:
            full_text += page.extract_text() + "\n\n"

        chunk_size = 1000
        chunks = []
        for i in range(0, len(full_text), chunk_size):
            chunk = full_text[i:i + chunk_size]
            if chunk.strip():
                chunks.append(chunk)

        # Удаляем старые чанки перед переиндексацией
        cur.execute("DELETE FROM t_p56134400_telegram_ai_bot_pdf.document_chunks WHERE document_id = %s", (document_id,))
        cur.execute("DELETE FROM t_p56134400_telegram_ai_bot_pdf.tenant_chunks WHERE document_id = %s", (document_id,))
        
        cur.execute("""
            SELECT ai_settings
            FROM t_p56134400_telegram_ai_bot_pdf.tenant_settings
            WHERE tenant_id = %s
        """, (tenant_id,))
        settings_row = cur.fetchone()
        
        embedding_provider = 'yandex'
        embedding_model = 'text-search-doc'

        for idx, chunk_text in enumerate(chunks):
            try:
                if embedding_provider == 'yandex':
                    import requests
                    yandex_api_key, error = get_tenant_api_key(tenant_id, 'yandex', 'api_key')
                    if error:
                        print(f"Yandex API key error for chunk {idx}: {error}")
                        embedding_json = None
                        continue
                    yandex_folder_id, error = get_tenant_api_key(tenant_id, 'yandex', 'folder_id')
                    if error:
                        print(f"Yandex folder ID error for chunk {idx}: {error}")
                        embedding_json = None
                        continue
                    
                    emb_response = requests.post(
                        'https://llm.api.cloud.yandex.net/foundationModels/v1/textEmbedding',
                        headers={
                            'Authorization': f'Api-Key {yandex_api_key}',
                            'Content-Type': 'application/json'
                        },
                        json={
                            'modelUri': f'emb://{yandex_folder_id}/{embedding_model}/latest',
                            'text': chunk_text
                        }
                    )
                    emb_data = emb_response.json()
                    embedding_vector = emb_data['embedding']
                    embedding_json = json.dumps(embedding_vector)
                else:
                    print(f"Unknown embedding provider: {embedding_provider}")
                    embedding_json = None
            except Exception as emb_error:
                print(f"Embedding error for chunk {idx}: {emb_error}")
                embedding_json = None

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

        cur.execute("""
            UPDATE t_p56134400_telegram_ai_bot_pdf.documents 
            SET status = 'ready', pages = %s, processed_at = %s
            WHERE id = %s
        """, (pages_count, datetime.now(), document_id))

        conn.commit()
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