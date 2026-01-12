import json
import os
import requests

def handler(event: dict, context) -> dict:
    """Webhook для WhatsApp Business API: принимает сообщения и отвечает через AI-консьержа"""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }

    # WhatsApp webhook verification (GET request)
    if method == 'GET':
        query_params = event.get('queryStringParameters', {})
        mode = query_params.get('hub.mode')
        token = query_params.get('hub.verify_token')
        challenge = query_params.get('hub.challenge')
        
        verify_token = os.environ.get('WHATSAPP_VERIFY_TOKEN', 'my_verify_token')
        
        if mode == 'subscribe' and token == verify_token:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*'},
                'body': challenge,
                'isBase64Encoded': False
            }
        else:
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Verification failed'}),
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
        
        # Проверяем структуру webhook от WhatsApp
        if 'entry' not in body or not body['entry']:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }

        entry = body['entry'][0]
        if 'changes' not in entry or not entry['changes']:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }

        change = entry['changes'][0]
        if 'value' not in change:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }

        value = change['value']
        
        # Обрабатываем только текстовые сообщения
        if 'messages' not in value or not value['messages']:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }

        message = value['messages'][0]
        
        # Игнорируем не текстовые сообщения
        if message.get('type') != 'text':
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }

        user_phone = message['from']
        user_message = message['text']['body']
        
        session_id = f"whatsapp-{user_phone}"

        # Вызываем chat функцию
        chat_function_url = 'https://functions.poehali.dev/7b58f4fb-5db0-4f85-bb3b-55bafa4cbf73'

        chat_response = requests.post(
            chat_function_url,
            json={
                'message': user_message,
                'sessionId': session_id
            },
            headers={'Content-Type': 'application/json'},
            timeout=30
        )

        if not chat_response.ok:
            raise Exception(f'Chat function error: {chat_response.status_code}')

        chat_data = chat_response.json()
        ai_message = chat_data.get('message', 'Извините, не могу ответить')

        # Получаем данные для WhatsApp API
        phone_number_id = os.environ.get('WHATSAPP_PHONE_NUMBER_ID')
        access_token = os.environ.get('WHATSAPP_ACCESS_TOKEN')
        
        if not phone_number_id or not access_token:
            raise Exception('WhatsApp credentials not configured')

        # Отправляем ответ через WhatsApp API
        whatsapp_api_url = f'https://graph.facebook.com/v18.0/{phone_number_id}/messages'
        
        whatsapp_response = requests.post(
            whatsapp_api_url,
            json={
                'messaging_product': 'whatsapp',
                'to': user_phone,
                'type': 'text',
                'text': {
                    'body': ai_message
                }
            },
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            },
            timeout=10
        )

        if not whatsapp_response.ok:
            raise Exception(f'WhatsApp API error: {whatsapp_response.status_code} - {whatsapp_response.text}')

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
