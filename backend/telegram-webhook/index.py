import json
import os
import sys
import requests
import re

sys.path.append('/function/code')
from api_keys_helper import get_tenant_api_key

def format_telegram(text: str) -> str:
    """Форматирование для Telegram с Markdown и эмодзи"""
    text = re.sub(r'^- (.+)$', r'• \1', text, flags=re.MULTILINE)
    text = re.sub(r'^\d+\. (.+)$', r'▫️ \1', text, flags=re.MULTILINE)
    text = re.sub(r'^([А-ЯЁA-Z][^:]+):$', r'*\1:*', text, flags=re.MULTILINE)
    
    emoji_map = {
        'бассейн': '🏊', 'сауна': '🧖', 'номер': '🏨',
        'завтрак': '🍳', 'обед': '🍽', 'ужин': '🍴',
        'трансфер': '🚗', 'пляж': '🏖', 'анимация': '🎭',
        'стоимость': '💰', 'цена': '💰', 'время': '🕐',
        'телефон': '📞', 'адрес': '📍'
    }
    
    for word, emoji in emoji_map.items():
        pattern = rf'^(.*\b{word}\b.*)$'
        if re.search(pattern, text, flags=re.IGNORECASE | re.MULTILINE):
            text = re.sub(pattern, rf'{emoji} \1', text, flags=re.IGNORECASE | re.MULTILINE, count=1)
    
    return text

def handler(event: dict, context) -> dict:
    """Webhook для Telegram-бота: принимает сообщения и отвечает через AI-консьержа"""
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

        session_id = f"telegram-{chat_id}"
        tenant_id = 1

        bot_token, error = get_tenant_api_key(tenant_id, 'telegram', 'bot_token')
        if error:
            return error

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
            
            # Форматируем для Telegram
            ai_message = format_telegram(ai_message)
            
        except requests.exceptions.Timeout:
            ai_message = 'Извините, сервис временно недоступен. Попробуйте позже.'
        except requests.exceptions.RequestException as e:
            print(f'Chat function error: {e}')
            ai_message = 'Извините, произошла ошибка. Попробуйте позже.'

        telegram_api_url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
        telegram_response = requests.post(
            telegram_api_url,
            json={
                'chat_id': chat_id,
                'text': ai_message,
                'parse_mode': 'Markdown'
            },
            timeout=10
        )

        if not telegram_response.ok:
            raise Exception(f'Telegram API error: {telegram_response.status_code}')

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