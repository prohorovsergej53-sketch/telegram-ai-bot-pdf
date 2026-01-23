import json
import os
import sys
import requests
import psycopg2
import re

sys.path.append('/function/code')
from api_keys_helper import get_tenant_api_key

def format_max(text: str) -> str:
    """Форматирование для MAX: убираем HTML, добавляем эмодзи и визуальное выделение"""
    # Убираем HTML-теги
    text = re.sub(r'<b>(.+?)</b>', r'▪️ \1', text, flags=re.IGNORECASE)
    text = re.sub(r'<i>(.+?)</i>', r'\1', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', '', text)  # Убираем все остальные теги
    
    # Форматируем списки
    text = re.sub(r'^- (.+)$', r'• \1', text, flags=re.MULTILINE)
    text = re.sub(r'^\d+\. (.+)$', r'▫️ \1', text, flags=re.MULTILINE)
    
    # Добавляем эмодзи для ключевых слов отеля
    emoji_map = {
        'Стандарт': '🏨',
        'Комфорт': '✨',
        'Люкс': '👑',
        'без питания': '🍽',
        'завтрак': '🍳',
        'полный пансион': '🍴',
        'руб': '💰'
    }
    
    for word, emoji in emoji_map.items():
        if word in text and emoji not in text[:text.index(word)] if word in text else True:
            text = text.replace(f'▪️ {word}', f'{emoji} {word}', 1)
    
    return text

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
        
        # MAX API structure: recipient.chat_id (для ответа) и body.text (текст сообщения)
        chat_id = message.get('recipient', {}).get('chat_id')
        sender_user_id = message.get('sender', {}).get('user_id')
        user_message = message.get('body', {}).get('text', '')
        
        if not chat_id or not user_message:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }

        session_id = f"max-{chat_id}"
        tenant_id = 2
        chat_function_url = 'https://functions.poehali.dev/7b58f4fb-5db0-4f85-bb3b-55bafa4cbf73'

        print(f'[max-webhook] Calling chat function for session={session_id}, tenant={tenant_id}, chat_id={chat_id}')
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
            
            # Форматируем для MAX
            ai_message = format_max(ai_message)
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

        # По документации MAX API: user_id передаётся в query, а не в body!
        # Используем sender.user_id для отправки личного сообщения пользователю
        print(f'[max-webhook] Sending response to sender_user_id={sender_user_id}: {ai_message[:50]}...')
        max_response = requests.post(
            f'https://platform-api.max.ru/messages?user_id={sender_user_id}',
            headers={
                'Authorization': bot_token,
                'Content-Type': 'application/json'
            },
            json={
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