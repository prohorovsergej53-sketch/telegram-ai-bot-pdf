import json
import os
import psycopg2
import hashlib
from datetime import datetime

def handler(event: dict, context) -> dict:
    """Управление версиями мастер-шаблона"""
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

        if method == 'GET':
            cur.execute("""
                SELECT 
                    mt.version, mt.description, mt.code_hash, mt.created_at, mt.created_by,
                    COUNT(DISTINCT t.id) as tenant_count
                FROM t_p56134400_telegram_ai_bot_pdf.master_template mt
                LEFT JOIN t_p56134400_telegram_ai_bot_pdf.tenants t ON t.template_version = mt.version
                GROUP BY mt.version, mt.description, mt.code_hash, mt.created_at, mt.created_by
                ORDER BY mt.created_at DESC
            """)
            rows = cur.fetchall()
            versions = []
            for row in rows:
                versions.append({
                    'version': row[0],
                    'description': row[1],
                    'code_hash': row[2],
                    'created_at': row[3].isoformat() if row[3] else None,
                    'created_by': row[4],
                    'tenant_count': row[5]
                })

            cur.close()
            conn.close()

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'versions': versions}),
                'isBase64Encoded': False
            }

        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            version = body.get('version')
            description = body.get('description', '')
            created_by = body.get('created_by', 'admin')

            if not version:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'version required'}),
                    'isBase64Encoded': False
                }

            # Генерируем хеш кода (в реальности это будет git commit hash или файловый хеш)
            code_hash = hashlib.sha256(f"{version}-{datetime.utcnow().isoformat()}".encode()).hexdigest()[:16]

            cur.execute("""
                INSERT INTO t_p56134400_telegram_ai_bot_pdf.master_template 
                (version, description, code_hash, created_by)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            """, (version, description, code_hash, created_by))
            
            version_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'version_id': version_id,
                    'code_hash': code_hash
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
