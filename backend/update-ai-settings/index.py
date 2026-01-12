import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    """Обновление настроек AI провайдеров"""
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
        settings = body.get('settings', {})

        if not settings:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'settings required'}),
                'isBase64Encoded': False
            }

        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()

        # Формируем JSONB объект с AI настройками
        ai_settings = {
            'model': settings.get('model', 'yandexgpt'),
            'temperature': str(settings.get('temperature', 0.15)),
            'top_p': str(settings.get('top_p', 1.0)),
            'frequency_penalty': str(settings.get('frequency_penalty', 0)),
            'presence_penalty': str(settings.get('presence_penalty', 0)),
            'max_tokens': settings.get('max_tokens', 600),
            'system_priority': settings.get('system_priority', 'strict'),
            'creative_mode': settings.get('creative_mode', 'off')
        }
        
        # Добавляем дополнительные настройки если они есть
        for key in ['chat_provider', 'chat_model', 'embedding_provider', 'embedding_model', 'system_prompt']:
            if key in settings:
                ai_settings[key] = settings[key]
        
        ai_settings_json = json.dumps(ai_settings)

        # Обновляем ai_settings в JSONB для tenant_id=1
        cur.execute("""
            UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
            SET ai_settings = %s::jsonb,
                updated_at = CURRENT_TIMESTAMP
            WHERE tenant_id = 1
        """, (ai_settings_json,))

        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'Settings updated'}),
            'isBase64Encoded': False
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }