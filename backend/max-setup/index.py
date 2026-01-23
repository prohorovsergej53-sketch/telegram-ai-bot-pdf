import json
import os
import sys
import requests

sys.path.append('/function/code')
from api_keys_helper import get_tenant_api_key

def handler(event: dict, context) -> dict:
    """Проверка токена MAX-бота и настройка webhook"""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token'
            },
            'body': '',
            'isBase64Encoded': False
        }

    try:
        query_params = event.get('queryStringParameters', {}) or {}
        tenant_id = int(query_params.get('tenant_id', 1))
        action = query_params.get('action', 'check')
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            bot_token = body.get('bot_token', '')
            webhook_url = body.get('webhook_url', '')

            if action == 'verify':
                try:
                    response = requests.get(
                        f'https://platform-api.max.ru/bot{bot_token}/getMe',
                        timeout=10
                    )
                    data = response.json()
                    
                    if data.get('ok'):
                        return {
                            'statusCode': 200,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'ok': True, 'bot_info': data.get('result')}),
                            'isBase64Encoded': False
                        }
                    else:
                        return {
                            'statusCode': 400,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'ok': False, 'error': data.get('description', 'Invalid token')}),
                            'isBase64Encoded': False
                        }
                except Exception as e:
                    return {
                        'statusCode': 500,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'ok': False, 'error': str(e)}),
                        'isBase64Encoded': False
                    }

            elif action == 'setup_webhook':
                if not webhook_url:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'ok': False, 'error': 'webhook_url required'}),
                        'isBase64Encoded': False
                    }

                try:
                    response = requests.post(
                        f'https://platform-api.max.ru/bot{bot_token}/setWebhook',
                        json={'url': webhook_url},
                        timeout=10
                    )
                    data = response.json()
                    
                    return {
                        'statusCode': 200 if data.get('ok') else 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps(data),
                        'isBase64Encoded': False
                    }
                except Exception as e:
                    return {
                        'statusCode': 500,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'ok': False, 'error': str(e)}),
                        'isBase64Encoded': False
                    }

        elif method == 'GET':
            bot_token, error = get_tenant_api_key(tenant_id, 'max', 'bot_token')
            if error:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'ok': False, 'error': 'Token not found'}),
                    'isBase64Encoded': False
                }

            if action == 'webhook_info':
                try:
                    response = requests.get(
                        f'https://platform-api.max.ru/bot{bot_token}/getWebhookInfo',
                        timeout=10
                    )
                    data = response.json()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps(data),
                        'isBase64Encoded': False
                    }
                except Exception as e:
                    return {
                        'statusCode': 500,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'ok': False, 'error': str(e)}),
                        'isBase64Encoded': False
                    }

        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid request'}),
            'isBase64Encoded': False
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
