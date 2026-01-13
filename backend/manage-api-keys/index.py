"""
Управление API ключами клиентов - сохранение и получение индивидуальных ключей
"""
import json
import os
import psycopg2
from auth_middleware import get_tenant_id_from_request

def handler(event: dict, context) -> dict:
    """Управление API ключами клиента"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    tenant_id, auth_error = get_tenant_id_from_request(event)
    if auth_error:
        return auth_error
    
    try:
        dsn = os.environ['DATABASE_URL']
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        if method == 'GET':
            # Получаем все ключи клиента (без значений для безопасности)
            cur.execute("""
                SELECT provider, key_name, 
                       CASE WHEN key_value IS NOT NULL THEN true ELSE false END as has_value,
                       is_active
                FROM t_p56134400_telegram_ai_bot_pdf.tenant_api_keys
                WHERE tenant_id = %s
            """, (tenant_id,))
            
            rows = cur.fetchall()
            keys = []
            for row in rows:
                keys.append({
                    'provider': row[0],
                    'key_name': row[1],
                    'has_value': row[2],
                    'is_active': row[3]
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'keys': keys}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' or method == 'PUT':
            # Сохраняем/обновляем ключ
            body = json.loads(event.get('body', '{}'))
            provider = body.get('provider')
            key_name = body.get('key_name')
            key_value = body.get('key_value')
            
            if not all([provider, key_name, key_value]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'provider, key_name и key_value обязательны'}),
                    'isBase64Encoded': False
                }
            
            # TODO: добавить шифрование key_value перед сохранением
            
            cur.execute("""
                INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenant_api_keys 
                (tenant_id, provider, key_name, key_value, is_active)
                VALUES (%s, %s, %s, %s, true)
                ON CONFLICT (tenant_id, provider, key_name)
                DO UPDATE SET key_value = EXCLUDED.key_value, 
                              updated_at = CURRENT_TIMESTAMP
            """, (tenant_id, provider, key_name, key_value))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'API ключ сохранён'}),
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
