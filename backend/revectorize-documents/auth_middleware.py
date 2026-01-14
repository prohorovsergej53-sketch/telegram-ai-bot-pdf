import jwt
import os
import json

def get_tenant_id_from_request(event: dict):
    """Extract tenant_id from JWT token in Authorization header or query params"""
    
    # Поддержка query параметра tenant_id для суперадмина
    query_params = event.get('queryStringParameters') or {}
    tenant_id_param = query_params.get('tenant_id')
    
    # Получить токен из заголовка (поддержка X-Authorization для Cloud Functions)
    headers = event.get('headers', {})
    auth_header = headers.get('Authorization') or headers.get('authorization') or headers.get('X-Authorization') or headers.get('x-authorization')
    
    if not auth_header:
        return None, {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized: No token provided'}),
            'isBase64Encoded': False
        }
    
    token = auth_header.replace('Bearer ', '').replace('bearer ', '')
    
    try:
        # Декодирование JWT
        secret = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        
        # Если есть tenant_id в query и пользователь - суперадмин
        if tenant_id_param and payload.get('is_superadmin'):
            return int(tenant_id_param), None
        
        # Обычный случай - tenant_id из токена
        tenant_id = payload.get('tenant_id')
        if not tenant_id:
            return None, {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized: Invalid token'}),
                'isBase64Encoded': False
            }
        
        return tenant_id, None
        
    except jwt.ExpiredSignatureError:
        return None, {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized: Token expired'}),
            'isBase64Encoded': False
        }
    except jwt.InvalidTokenError:
        return None, {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized: Invalid token'}),
            'isBase64Encoded': False
        }
