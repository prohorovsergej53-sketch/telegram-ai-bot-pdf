import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''Миграция старых настроек AI: автоматическое определение provider по модели'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization, X-Cookie'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        # Получаем все tenant_settings с ai_settings
        cur.execute('''
            SELECT tenant_id, ai_settings 
            FROM t_p56134400_telegram_ai_bot_pdf.tenant_settings 
            WHERE ai_settings IS NOT NULL
        ''')
        
        settings_to_update = cur.fetchall()
        updated_count = 0
        
        for tenant_id, ai_settings in settings_to_update:
            if not ai_settings or not isinstance(ai_settings, dict):
                continue
            
            provider = ai_settings.get('provider')
            model = ai_settings.get('model')
            
            # Пропускаем, если provider уже установлен
            if provider and provider != '':
                continue
            
            if not model:
                continue
            
            # Определяем provider по модели
            new_provider = None
            new_model = model
            
            if model in ['yandexgpt', 'yandexgpt-lite']:
                new_provider = 'yandex'
            elif model.startswith('openrouter-'):
                new_provider = 'openrouter'
                new_model = model.replace('openrouter-', '')
            else:
                # Все остальные модели - это OpenRouter
                new_provider = 'openrouter'
            
            # Обновляем provider в JSONB
            ai_settings['provider'] = new_provider
            ai_settings['model'] = new_model
            
            # Обновляем настройку
            cur.execute('''
                UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings 
                SET ai_settings = %s::jsonb
                WHERE tenant_id = %s
            ''', (json.dumps(ai_settings), tenant_id))
            
            updated_count += 1
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'updated_count': updated_count,
                'message': f'Обновлено настроек: {updated_count}'
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }