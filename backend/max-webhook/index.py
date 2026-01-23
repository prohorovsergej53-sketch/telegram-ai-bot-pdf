import json
import os
import sys
import requests
import psycopg2

sys.path.append('/function/code')
from api_keys_helper import get_tenant_api_key

def handler(event: dict, context) -> dict:
    """Webhook для MAX-бота: принимает сообщения и отвечает через AI-консьержа"""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }

    try:
        body = json.loads(event.get('body', '{}'))
        
        if 'message' not in body:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }

        message = body['message']
        chat_id = message['chat']['id']
        user_message = message.get('text', '')

        if not user_message:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }

        session_id = f"max-{chat_id}"
        tenant_id = 2
        chat_function_url = 'https://functions.poehali.dev/7b58f4fb-5db0-4f85-bb3b-55bafa4cbf73'

        try:
            chat_response = requests.post(
                chat_function_url,
                json={
                    'message': user_message,
                    'sessionId': session_id,
                    'tenantId': tenant_id
                },
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            chat_response.raise_for_status()
            chat_data = chat_response.json()
            ai_message = chat_data.get('message', 'Извините, не могу ответить')
            
        except requests.exceptions.Timeout:
            ai_message = 'Извините, сервис временно недоступен. Попробуйте позже.'
        except requests.exceptions.RequestException as e:
            print(f'Chat function error: {e}')
            ai_message = 'Извините, произошла ошибка. Попробуйте позже.'

        bot_token, error = get_tenant_api_key(tenant_id, 'max', 'bot_token')
        if error:
            return error

        max_response = requests.post(
            'https://platform-api.max.ru/messages',
            headers={'Authorization': bot_token},
            json={
                'chat_id': chat_id,
                'text': ai_message
            },
            timeout=10
        )

        if not max_response.ok:
            raise Exception(f'MAX API error: {max_response.status_code}')

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }

    except Exception as e:
        print(f'Webhook error: {e}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }