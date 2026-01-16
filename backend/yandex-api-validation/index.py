import json
import requests

def handler(event: dict, context) -> dict:
    """Валидация API ключа и Folder ID для YandexGPT"""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }

    try:
        body_str = event.get('body', '{}')
        if not body_str or body_str == '':
            body_str = '{}'
        
        body = json.loads(body_str)
        api_key = body.get('api_key', '')
        folder_id = body.get('folder_id', '')

        if not api_key or not folder_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'valid': False, 'error': 'API ключ и Folder ID обязательны'}),
                'isBase64Encoded': False
            }

        # Проверяем валидность ключа через тестовый запрос к YandexGPT
        url = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'
        headers = {
            'Authorization': f'Api-Key {api_key}',
            'Content-Type': 'application/json'
        }
        payload = {
            'modelUri': f'gpt://{folder_id}/yandexgpt-lite/latest',
            'completionOptions': {
                'stream': False,
                'temperature': 0.1,
                'maxTokens': 10
            },
            'messages': [
                {
                    'role': 'user',
                    'text': 'test'
                }
            ]
        }

        response = requests.post(url, headers=headers, json=payload, timeout=10)
        
        if response.status_code == 200:
            # Ключ валиден, получаем информацию о балансе (опционально)
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'valid': True,
                    'message': 'API ключ успешно проверен'
                }),
                'isBase64Encoded': False
            }
        elif response.status_code == 401:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'valid': False,
                    'error': 'Неверный API ключ'
                }),
                'isBase64Encoded': False
            }
        elif response.status_code == 403:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'valid': False,
                    'error': 'Неверный Folder ID или нет доступа'
                }),
                'isBase64Encoded': False
            }
        else:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'valid': False,
                    'error': f'Ошибка проверки: {response.status_code}'
                }),
                'isBase64Encoded': False
            }

    except requests.exceptions.Timeout:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'valid': False,
                'error': 'Таймаут при проверке ключа'
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f'Error validating Yandex API: {e}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'valid': False, 'error': str(e)}),
            'isBase64Encoded': False
        }