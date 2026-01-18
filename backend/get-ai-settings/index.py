import json
import os
import psycopg2
from auth_middleware import get_tenant_id_from_request

def handler(event: dict, context) -> dict:
    """Получение настроек AI провайдеров с проверкой прав доступа"""
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
        tenant_id, auth_error = get_tenant_id_from_request(event)
        if auth_error:
            return auth_error
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()

        cur.execute("""
            SELECT ai_settings
            FROM t_p56134400_telegram_ai_bot_pdf.tenant_settings
            WHERE tenant_id = %s
        """, (tenant_id,))
        
        row = cur.fetchone()
        settings_raw = row[0] if row and row[0] else {}
        
        # Преобразуем строковые значения в числа где нужно
        # Новая схема: chat_provider + chat_model, старая схема: provider + model
        chat_provider = settings_raw.get('chat_provider', settings_raw.get('provider', 'openrouter'))
        chat_model = settings_raw.get('chat_model', settings_raw.get('model', 'deepseek-chat'))
        
        # Автоматическая миграция: deepseek → openrouter
        if chat_provider == 'deepseek':
            chat_provider = 'openrouter'
        
        settings = {
            'provider': chat_provider,  # Для обратной совместимости с frontend
            'model': chat_model,        # Для обратной совместимости с frontend
            'temperature': float(settings_raw.get('temperature', 0.15)),
            'top_p': float(settings_raw.get('top_p', 1.0)),
            'frequency_penalty': float(settings_raw.get('frequency_penalty', 0)),
            'presence_penalty': float(settings_raw.get('presence_penalty', 0)),
            'max_tokens': int(settings_raw.get('max_tokens', 600)),
            'system_priority': settings_raw.get('system_priority', 'strict'),
            'creative_mode': settings_raw.get('creative_mode', 'off'),
            'chat_provider': chat_provider,      # Новая схема
            'chat_model': chat_model,            # Новая схема
            'embedding_provider': settings_raw.get('embedding_provider', 'openai'),
            'embedding_model': settings_raw.get('embedding_model', 'text-embedding-3-small'),
            'system_prompt': settings_raw.get('system_prompt', '''Вы - вежливый и профессиональный консьерж отеля. Отвечайте на вопросы гостей, используя только информацию из базы знаний.

ПРАВИЛА ФОРМАТИРОВАНИЯ ОТВЕТОВ:
1. Используйте понятные названия вместо аббревиатур:
   - Вместо "RO" пишите "без питания"
   - Вместо "BB" пишите "завтрак включён"
   - Вместо "HB" пишите "завтрак + ужин"
   - Вместо "FB" пишите "полный пансион (завтрак, обед, ужин)"

2. Форматируйте списки с хорошими отступами:
   - Используйте двойной перенос строки между категориями
   - Добавляйте пустую строку после заголовков
   - Группируйте связанную информацию вместе

3. Пример хорошего форматирования тарифов:

🏠 **Стандарт (2 гостя):**
• Без питания: 4 000 ₽
• Завтрак включён: 5 600 ₽
• Полный пансион: 8 300 ₽

🏠 **Комфорт (2 гостя):**
• Без питания: 4 500 ₽
• Завтрак включён: 6 100 ₽
• Полный пансион: 8 800 ₽

Используйте двойной перенос строки (\n\n) между категориями для лучшей читабельности.''')
        }

        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'settings': settings}),
            'isBase64Encoded': False
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }