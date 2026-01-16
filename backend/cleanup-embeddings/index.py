import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """Очистка устаревших эмбеддингов удалённых документов"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }

    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute("""
            DELETE FROM t_p56134400_telegram_ai_bot_pdf.tenant_chunks
            WHERE document_id NOT IN (
                SELECT id FROM t_p56134400_telegram_ai_bot_pdf.tenant_documents
            )
        """)
        
        deleted_tenant_chunks = cur.rowcount
        
        cur.execute("""
            DELETE FROM t_p56134400_telegram_ai_bot_pdf.document_chunks
            WHERE document_id NOT IN (
                SELECT id FROM t_p56134400_telegram_ai_bot_pdf.documents
            )
        """)
        
        deleted_count = deleted_tenant_chunks + cur.rowcount
        conn.commit()
        
        cur.close()
        conn.close()
        
        result = {
            'ok': True,
            'deleted_embeddings': deleted_count,
            'message': f'Удалено {deleted_count} устаревших эмбеддингов'
        }
        
        print(f'Cleanup completed: {json.dumps(result)}')
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result),
            'isBase64Encoded': False
        }

    except Exception as e:
        print(f'Error cleaning up embeddings: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }