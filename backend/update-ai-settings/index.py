import json
import os
import psycopg2
from datetime import datetime
from auth_middleware import get_tenant_id_from_request

def handler(event: dict, context) -> dict:
    """Обновление настроек AI провайдеров"""
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

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }

    try:
        tenant_id, auth_error = get_tenant_id_from_request(event)
        if auth_error:
            return auth_error
        
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

        cur.execute("""
            SELECT ai_settings
            FROM t_p56134400_telegram_ai_bot_pdf.tenant_settings
            WHERE tenant_id = %s
        """, (tenant_id,))
        settings_row = cur.fetchone()
        
        # Начинаем с текущих настроек или дефолтных
        if settings_row and settings_row[0]:
            ai_settings = settings_row[0]
        else:
            ai_settings = {
                'model': 'yandexgpt',
                'temperature': '0.15',
                'top_p': '1.0',
                'frequency_penalty': '0',
                'presence_penalty': '0',
                'max_tokens': 600,
                'system_priority': 'strict',
                'creative_mode': 'off',
                'chat_provider': 'deepseek',
                'chat_model': 'deepseek-chat',
                'embedding_provider': 'openai',
                'embedding_model': 'text-embedding-3-small',
                'system_prompt': 'Вы - вежливый и профессиональный консьерж отеля. Отвечайте на вопросы гостей, используя только информацию из базы знаний.'
            }
        
        # Обновляем переданные поля
        for key, value in settings.items():
            if key in ['temperature', 'top_p', 'frequency_penalty', 'presence_penalty']:
                ai_settings[key] = str(value)
            elif key in ['chat_provider', 'chat_model', 'embedding_provider', 'embedding_model', 'system_prompt', 'max_tokens', 'system_priority', 'creative_mode', 'model']:
                ai_settings[key] = value
        
        ai_settings_json = json.dumps(ai_settings)

        cur.execute("""
            UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
            SET ai_settings = %s::jsonb,
                updated_at = CURRENT_TIMESTAMP
            WHERE tenant_id = %s
        """, (ai_settings_json, tenant_id))

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