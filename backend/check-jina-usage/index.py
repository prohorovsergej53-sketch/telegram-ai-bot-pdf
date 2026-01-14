import json
import os
import requests

def handler(event: dict, context) -> dict:
    """Проверка остатка токенов Jina AI"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
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
        jina_api_key = os.environ.get('JINA_API_KEY')
        
        if not jina_api_key or jina_api_key == 'jina_free':
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': 'JINA_API_KEY не настроен',
                    'connected': False
                }),
                'isBase64Encoded': False
            }

        # Проверяем статус через API - делаем тестовый запрос
        response = requests.post(
            'https://api.jina.ai/v1/embeddings',
            headers={
                'Authorization': f'Bearer {jina_api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'jina-embeddings-v2-base-en',
                'input': ['test']
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Получаем информацию об использовании из заголовков (если доступно)
            usage_info = {}
            
            # Jina AI может возвращать usage в ответе
            if 'usage' in data:
                usage_info = data['usage']
            
            # Проверяем заголовки с лимитами
            headers = response.headers
            remaining = headers.get('x-ratelimit-remaining-tokens')
            limit = headers.get('x-ratelimit-limit-tokens')
            
            result = {
                'connected': True,
                'provider': 'jinaai',
                'model': 'jina-embeddings-v2-base-en',
                'status': 'active'
            }
            
            if remaining:
                result['remaining_tokens'] = int(remaining)
            if limit:
                result['total_tokens'] = int(limit)
            
            # Добавляем usage из ответа (токены использованные в запросе)
            if usage_info:
                result['last_request_tokens'] = usage_info.get('total_tokens', 0)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        elif response.status_code == 401:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'connected': False,
                    'error': 'Неверный API ключ Jina AI',
                    'status': 'invalid_key'
                }),
                'isBase64Encoded': False
            }
        elif response.status_code == 429:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'connected': True,
                    'error': 'Превышен лимит запросов',
                    'status': 'rate_limited',
                    'remaining_tokens': 0
                }),
                'isBase64Encoded': False
            }
        else:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'connected': False,
                    'error': f'Ошибка API: {response.status_code}',
                    'status': 'error'
                }),
                'isBase64Encoded': False
            }

    except requests.exceptions.Timeout:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'connected': False,
                'error': 'Таймаут подключения к Jina AI',
                'status': 'timeout'
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'connected': False,
                'error': str(e),
                'status': 'error'
            }),
            'isBase64Encoded': False
        }
