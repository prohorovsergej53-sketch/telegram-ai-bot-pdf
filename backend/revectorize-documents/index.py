import json
import os
import psycopg2
from auth_middleware import get_tenant_id_from_request

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

            # TODO: Запустить асинхронную задачу ревекторизации через очередь
            # Сейчас - мок, который постепенно обновляет прогресс
            # В реальности должна быть отдельная Cloud Function или Worker

            cur.close()
            conn.close()

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'status': 'processing',
                    'total': total_docs,
                    'message': f'Revectorization started for {total_docs} documents'
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
