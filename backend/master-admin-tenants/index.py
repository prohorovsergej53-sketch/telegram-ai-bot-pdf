import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    """Управление тенантами в мастер-админке"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
                    t.id, t.slug, t.name, t.description, t.owner_email, t.owner_phone,
                    t.template_version, t.auto_update, t.status, t.created_at, t.updated_at,
                    (SELECT COUNT(*) FROM t_p56134400_telegram_ai_bot_pdf.tenant_documents WHERE tenant_id = t.id) as doc_count,
                    (SELECT COUNT(*) FROM t_p56134400_telegram_ai_bot_pdf.tenant_messages WHERE tenant_id = t.id) as message_count,
                    ts.telegram_settings
                FROM t_p56134400_telegram_ai_bot_pdf.tenants t
                LEFT JOIN t_p56134400_telegram_ai_bot_pdf.tenant_settings ts ON ts.tenant_id = t.id
                ORDER BY t.created_at DESC
            """)
            rows = cur.fetchall()
            tenants = []
            for row in rows:
                telegram_settings = row[13] if row[13] else {}
                tenants.append({
                    'id': row[0],
                    'slug': row[1],
                    'name': row[2],
                    'description': row[3],
                    'owner_email': row[4],
                    'owner_phone': row[5],
                    'template_version': row[6],
                    'auto_update': row[7],
                    'status': row[8],
                    'created_at': row[9].isoformat() if row[9] else None,
                    'updated_at': row[10].isoformat() if row[10] else None,
                    'doc_count': row[11],
                    'message_count': row[12],
                    'telegram_connected': bool(telegram_settings.get('bot_token')),
                    'whatsapp_connected': bool(telegram_settings.get('whatsapp_phone_id')),
                    'vk_connected': bool(telegram_settings.get('vk_group_id'))
                })

            cur.close()
            conn.close()

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'tenants': tenants}),
                'isBase64Encoded': False
            }

        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            slug = body.get('slug')
            name = body.get('name')
            description = body.get('description', '')
            owner_email = body.get('owner_email')
            owner_phone = body.get('owner_phone')
            template_version = body.get('template_version', '1.0.0')
            auto_update = body.get('auto_update', False)

            if not slug or not name:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'slug and name required'}),
                    'isBase64Encoded': False
                }

            cur.execute("""
                INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenants 
                (slug, name, description, owner_email, owner_phone, template_version, auto_update, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, 'active')
                RETURNING id
            """, (slug, name, description, owner_email, owner_phone, template_version, auto_update))
            
            tenant_id = cur.fetchone()[0]

            cur.execute("""
                INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenant_settings (tenant_id)
                VALUES (%s)
            """, (tenant_id,))

            conn.commit()
            cur.close()
            conn.close()

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'tenant_id': tenant_id}),
                'isBase64Encoded': False
            }

        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            tenant_id = body.get('id')
            updates = []
            params = []

            if body.get('name'):
                updates.append('name = %s')
                params.append(body['name'])
            if 'description' in body:
                updates.append('description = %s')
                params.append(body['description'])
            if 'owner_email' in body:
                updates.append('owner_email = %s')
                params.append(body['owner_email'])
            if 'owner_phone' in body:
                updates.append('owner_phone = %s')
                params.append(body['owner_phone'])
            if 'auto_update' in body:
                updates.append('auto_update = %s')
                params.append(body['auto_update'])
            if 'status' in body:
                updates.append('status = %s')
                params.append(body['status'])
            if 'template_version' in body:
                updates.append('template_version = %s')
                params.append(body['template_version'])

            if updates:
                updates.append('updated_at = CURRENT_TIMESTAMP')
                params.append(tenant_id)
                
                cur.execute(f"""
                    UPDATE t_p56134400_telegram_ai_bot_pdf.tenants
                    SET {', '.join(updates)}
                    WHERE id = %s
                """, params)
                
                conn.commit()

            cur.close()
            conn.close()

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
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