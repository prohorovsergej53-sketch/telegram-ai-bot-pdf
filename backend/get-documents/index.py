import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """Получение списка всех документов"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }

    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }

    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute("""
            SELECT id, name, size_bytes, pages, category, status, uploaded_at, processed_at
            FROM documents
            ORDER BY uploaded_at DESC
        """)
        
        rows = cur.fetchall()
        documents = []
        
        for row in rows:
            doc = {
                'id': row[0],
                'name': row[1],
                'size': f"{row[2] / 1024 / 1024:.1f} MB" if row[2] else "0 MB",
                'pages': row[3] or 0,
                'category': row[4] or 'Общая',
                'status': row[5],
                'uploadedAt': row[6].strftime('%Y-%m-%d') if row[6] else None,
                'processedAt': row[7].strftime('%Y-%m-%d %H:%M') if row[7] else None
            }
            documents.append(doc)

        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'documents': documents}),
            'isBase64Encoded': False
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
