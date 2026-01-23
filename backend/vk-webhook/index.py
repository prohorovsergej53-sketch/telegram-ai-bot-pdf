import json
import os
import sys
import requests
import hashlib
import psycopg2
import re

sys.path.append('/function/code')
from api_keys_helper import get_tenant_api_key, get_tenant_id_by_secret
from formatting_helper import get_formatting_settings, format_with_settings

def handler(event: dict, context) -> dict:
    """Webhook для VK-бота: принимает сообщения и отвечает через AI-консьержа"""
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
        
        # Определяем tenant_id по secret из VK или query параметра
        received_secret = body.get('secret', '')
        query_params = event.get('queryStringParameters', {}) or {}
        tenant_id_param = query_params.get('tenant_id', '')
        
        if received_secret:
            tenant_id = get_tenant_id_by_secret(received_secret)
        elif tenant_id_param:
            try:
                tenant_id = int(tenant_id_param)
            except ValueError:
                tenant_id = None
        else:
            tenant_id = None
        
        if not tenant_id:
            print(f'[vk-webhook] Could not determine tenant_id from secret or query param')
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid tenant_id'}),
                'isBase64Encoded': False
            }
        
        print(f'[vk-webhook] Using tenant_id={tenant_id}')

        event_type = body.get('type')

        if event_type == 'confirmation':
            group_id, error = get_tenant_api_key(tenant_id, 'vk', 'group_id')
            if error:
                return error
            confirmation_code = f'vk_confirm_{group_id}'
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*'},
                'body': confirmation_code,
                'isBase64Encoded': False
            }

        if event_type == 'message_new':
            obj = body.get('object', {})
            message = obj.get('message', {})
            user_id = message.get('from_id')
            user_message = message.get('text', '')

            if not user_message:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*'},
                    'body': 'ok',
                    'isBase64Encoded': False
                }

            session_id = f"vk-{user_id}"
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
                    timeout=60
                )
                chat_response.raise_for_status()
                chat_data = chat_response.json()
                ai_message = chat_data.get('message', 'Извините, не могу ответить')
                
                # Форматируем согласно настройкам тенанта
                settings = get_formatting_settings(tenant_id, 'vk')
                ai_message = format_with_settings(ai_message, settings, 'vk')
                
            except requests.exceptions.Timeout:
                ai_message = 'Извините, сервис временно недоступен. Попробуйте позже.'
            except requests.exceptions.RequestException as e:
                print(f'Chat function error: {e}')
                ai_message = 'Извините, произошла ошибка. Попробуйте позже.'

            group_token, error = get_tenant_api_key(tenant_id, 'vk', 'group_token')
            if error:
                return error

            vk_api_url = 'https://api.vk.com/method/messages.send'
            vk_response = requests.post(
                vk_api_url,
                data={
                    'user_id': user_id,
                    'message': ai_message,
                    'random_id': 0,
                    'access_token': group_token,
                    'v': '5.131'
                },
                timeout=10
            )

            vk_data = vk_response.json()
            if 'error' in vk_data:
                raise Exception(f'VK API error: {vk_data["error"]["error_msg"]}')

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*'},
                'body': 'ok',
                'isBase64Encoded': False
            }

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*'},
            'body': 'ok',
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