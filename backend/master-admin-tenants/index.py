import json
import os
import psycopg2
import hashlib
import secrets
import string
from datetime import datetime

def handler(event: dict, context) -> dict:
    """Управление тенантами, дефолтными настройками и пользователями"""
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
        
        query_params = event.get('queryStringParameters') or {}
        action = query_params.get('action', 'tenants')
        
        if action == 'default_settings':
            return handle_default_settings(method, event, cur, conn)
        elif action == 'create_user':
            return handle_create_user(method, event, cur, conn)
        elif action == 'public_content':
            return handle_public_content(method, event, cur, conn)

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

            if 'slug' in body:
                updates.append('slug = %s')
                params.append(body['slug'])
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

def handle_default_settings(method, event, cur, conn):
    if method == 'GET':
        cur.execute("""
            SELECT setting_key, setting_value, description, updated_at
            FROM t_p56134400_telegram_ai_bot_pdf.default_settings
            ORDER BY setting_key
        """)
        rows = cur.fetchall()
        settings = {}
        for row in rows:
            settings[row[0]] = {
                'value': row[1],
                'description': row[2],
                'updated_at': row[3].isoformat() if row[3] else None
            }
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'settings': settings}),
            'isBase64Encoded': False
        }
    elif method == 'PUT':
        body = json.loads(event.get('body', '{}'))
        setting_key = body.get('setting_key')
        setting_value = body.get('setting_value')
        if not setting_key:
            return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'setting_key required'}), 'isBase64Encoded': False}
        cur.execute("""
            UPDATE t_p56134400_telegram_ai_bot_pdf.default_settings
            SET setting_value = %s, updated_at = NOW()
            WHERE setting_key = %s
            RETURNING setting_key
        """, (setting_value, setting_key))
        if cur.rowcount == 0:
            cur.close()
            conn.close()
            return {'statusCode': 404, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Setting not found'}), 'isBase64Encoded': False}
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True}), 'isBase64Encoded': False}

def handle_create_user(method, event, cur, conn):
    if method != 'POST':
        return {'statusCode': 405, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'}), 'isBase64Encoded': False}
    body = json.loads(event.get('body', '{}'))
    tenant_id = body.get('tenant_id')
    email = body.get('email')
    username = body.get('username')
    if not tenant_id or not email:
        return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'tenant_id and email required'}), 'isBase64Encoded': False}
    if not username:
        cur.execute("SELECT slug FROM t_p56134400_telegram_ai_bot_pdf.tenants WHERE id = %s", (tenant_id,))
        result = cur.fetchone()
        if not result:
            cur.close()
            conn.close()
            return {'statusCode': 404, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Tenant not found'}), 'isBase64Encoded': False}
        username = f"{result[0]}_user"
    password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    cur.execute("SELECT id FROM t_p56134400_telegram_ai_bot_pdf.admin_users WHERE username = %s OR (email = %s AND email IS NOT NULL)", (username, email))
    if cur.fetchone():
        cur.close()
        conn.close()
        return {'statusCode': 409, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'User already exists'}), 'isBase64Encoded': False}
    cur.execute("""
        INSERT INTO t_p56134400_telegram_ai_bot_pdf.admin_users 
        (username, password_hash, email, role, tenant_id, is_active)
        VALUES (%s, %s, %s, 'content_editor', %s, true)
        RETURNING id
    """, (username, password_hash, email, tenant_id))
    user_id = cur.fetchone()[0]
    cur.execute("SELECT setting_value FROM t_p56134400_telegram_ai_bot_pdf.default_settings WHERE setting_key = 'email_template_welcome'")
    email_template_row = cur.fetchone()
    email_template = email_template_row[0] if email_template_row else 'Здравствуйте!\n\nВаш логин: {username}\nВаш пароль: {password}'
    conn.commit()
    cur.close()
    conn.close()
    login_url = f"https://your-domain.com/tenant-login"
    email_body = email_template.format(username=username, password=password, login_url=login_url)
    return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True, 'user_id': user_id, 'username': username, 'email_body': email_body}), 'isBase64Encoded': False}

def handle_public_content(method, event, cur, conn):
    query_params = event.get('queryStringParameters') or {}
    tenant_id = query_params.get('tenant_id')
    if not tenant_id:
        return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'tenant_id required'}), 'isBase64Encoded': False}
    if method == 'GET':
        cur.execute("""
            SELECT t.name, t.description, ts.public_description, ts.page_settings
            FROM t_p56134400_telegram_ai_bot_pdf.tenants t
            LEFT JOIN t_p56134400_telegram_ai_bot_pdf.tenant_settings ts ON ts.tenant_id = t.id
            WHERE t.id = %s
        """, (tenant_id,))
        row = cur.fetchone()
        if not row:
            cur.close()
            conn.close()
            return {'statusCode': 404, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Tenant not found'}), 'isBase64Encoded': False}
        page_settings = row[3] if row[3] else {}
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'name': row[0], 'description': row[1], 'public_description': row[2] or '', 'faq': page_settings.get('faq', []), 'welcome_text': page_settings.get('welcome_text', ''), 'contact_info': page_settings.get('contact_info', {})}), 'isBase64Encoded': False}
    elif method == 'PUT':
        body = json.loads(event.get('body', '{}'))
        public_description = body.get('public_description')
        faq = body.get('faq')
        welcome_text = body.get('welcome_text')
        contact_info = body.get('contact_info')
        cur.execute("SELECT page_settings FROM t_p56134400_telegram_ai_bot_pdf.tenant_settings WHERE tenant_id = %s", (tenant_id,))
        result = cur.fetchone()
        page_settings = result[0] if result and result[0] else {}
        if faq is not None:
            page_settings['faq'] = faq
        if welcome_text is not None:
            page_settings['welcome_text'] = welcome_text
        if contact_info is not None:
            page_settings['contact_info'] = contact_info
        if public_description is not None:
            cur.execute("""
                UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
                SET public_description = %s, page_settings = %s, updated_at = NOW()
                WHERE tenant_id = %s
            """, (public_description, json.dumps(page_settings), tenant_id))
        else:
            cur.execute("""
                UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
                SET page_settings = %s, updated_at = NOW()
                WHERE tenant_id = %s
            """, (json.dumps(page_settings), tenant_id))
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True}), 'isBase64Encoded': False}