import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """API для управления тенантами (клиентами) - только для суперадмина"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }

    try:
        # Проверка авторизации суперадмина
        import jwt
        headers = event.get('headers', {})
        auth_header = headers.get('X-Authorization') or headers.get('Authorization') or headers.get('authorization') or ''
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized'}),
                'isBase64Encoded': False
            }
        
        token = auth_header.replace('Bearer ', '')
        jwt_secret = os.environ.get('JWT_SECRET', 'default-jwt-secret-change-in-production')
        
        try:
            payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
            user_role = payload.get('role')
            
            if user_role != 'super_admin':
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Super admin access required'}),
                    'isBase64Encoded': False
                }
        except jwt.ExpiredSignatureError:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Token expired'}),
                'isBase64Encoded': False
            }
        except jwt.InvalidTokenError:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid token'}),
                'isBase64Encoded': False
            }

        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        schema = 't_p56134400_telegram_ai_bot_pdf'

        if method == 'GET':
            # Получить всех тенантов
            cur.execute(f"""
                SELECT t.id, t.slug, t.name, t.description, t.tariff_id, 
                       t.subscription_end_date, t.created_at,
                       COUNT(DISTINCT d.id) as documents_count,
                       COUNT(DISTINCT u.id) as admins_count,
                       STRING_AGG(DISTINCT u.email, ', ') as admin_emails
                FROM {schema}.tenants t
                LEFT JOIN {schema}.tenant_documents d ON t.id = d.tenant_id
                LEFT JOIN {schema}.admin_users u ON t.id = u.tenant_id
                GROUP BY t.id, t.slug, t.name, t.description, t.tariff_id, 
                         t.subscription_end_date, t.created_at
                ORDER BY t.created_at DESC
            """)
            
            rows = cur.fetchall()
            tenants = []
            
            for row in rows:
                tenant = dict(row)
                tenant['created_at'] = tenant['created_at'].isoformat() if tenant['created_at'] else None
                tenant['subscription_end_date'] = tenant['subscription_end_date'].isoformat() if tenant['subscription_end_date'] else None
                tenants.append(tenant)
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'tenants': tenants}),
                'isBase64Encoded': False
            }

        elif method == 'PUT':
            # Обновить тенанта (например, сменить тариф)
            body = json.loads(event.get('body', '{}'))
            tenant_id = body.get('tenant_id')
            new_tariff_id = body.get('tariff_id')
            
            if not tenant_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'tenant_id required'}),
                    'isBase64Encoded': False
                }
            
            update_fields = []
            params = []
            
            if new_tariff_id:
                update_fields.append('tariff_id = %s')
                params.append(new_tariff_id)
            
            if 'subscription_end_date' in body:
                update_fields.append('subscription_end_date = %s')
                params.append(body['subscription_end_date'])
            
            if not update_fields:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'No fields to update'}),
                    'isBase64Encoded': False
                }
            
            update_fields.append('updated_at = CURRENT_TIMESTAMP')
            params.append(tenant_id)
            
            query = f"""
                UPDATE {schema}.tenants
                SET {', '.join(update_fields)}
                WHERE id = %s
            """
            
            cur.execute(query, params)
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'Tenant updated'}),
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