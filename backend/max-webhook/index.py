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
        print(f'[max-webhook] Received body: {json.dumps(body)}')
        
        if 'message' not in body:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }

        message = body['message']
        print(f'[max-webhook] Message structure: {json.dumps(message)}')
        
        # MAX API structure: message.sender.user_id (for reply) and message.body.text
        sender_user_id = message.get('sender', {}).get('user_id')
        user_message = message.get('body', {}).get('text', '')
        
        if not sender_user_id or not user_message:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }

        session_id = f"max-{sender_user_id}"
        tenant_id = 2
        chat_function_url = 'https://functions.poehali.dev/7b58f4fb-5db0-4f85-bb3b-55bafa4cbf73'

        print(f'[max-webhook] Calling chat function for session={session_id}, tenant={tenant_id}, user_id={sender_user_id}')
        try:
            chat_response = requests.post(
                chat_function_url,
                json={
                    'message': user_message,
                    'sessionId': session_id,
                    'tenantId': tenant_id
                },
                headers={'Content-Type': 'application/json'},
                timeout=15
            )
            print(f'[max-webhook] Chat function response status: {chat_response.status_code}')
            chat_response.raise_for_status()
            chat_data = chat_response.json()
            ai_message = chat_data.get('message', 'Извините, не могу ответить')
            print(f'[max-webhook] AI response received: {ai_message[:100]}...')
            
        except requests.exceptions.Timeout:
            print(f'[max-webhook] Chat function timeout')
            ai_message = 'Извините, сервис временно недоступен. Попробуйте позже.'
        except requests.exceptions.RequestException as e:
            print(f'[max-webhook] Chat function error: {e}')
            ai_message = 'Извините, произошла ошибка. Попробуйте позже.'

        bot_token, error = get_tenant_api_key(tenant_id, 'max', 'bot_token')
        if error:
            return error

        print(f'[max-webhook] Sending response to user_id={sender_user_id}: {ai_message[:50]}...')
        max_response = requests.post(
            'https://platform-api.max.ru/messages',
            headers={'Authorization': bot_token},
            json={
                'user_id': sender_user_id,
                'text': ai_message
            },
            timeout=10
        )
        print(f'[max-webhook] MAX API send response status: {max_response.status_code}')

        if not max_response.ok:
            error_text = max_response.text
            print(f'[max-webhook] MAX API error response: {error_text}')
            raise Exception(f'MAX API error: {max_response.status_code} - {error_text}')

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