import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''Обновление настроек виджета'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    data = json.loads(event.get('body', '{}'))
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    # Формируем JSONB объект с настройками виджета
    widget_settings = {
        'button_color': data.get('button_color', '#3b82f6'),
        'button_color_end': data.get('button_color_end', '#1d4ed8'),
        'button_size': data.get('button_size', 60),
        'button_position': data.get('button_position', 'bottom-right'),
        'button_icon': data.get('button_icon', 'MessageCircle'),
        'window_width': data.get('window_width', 380),
        'window_height': data.get('window_height', 600),
        'header_title': data.get('header_title', 'AI Ассистент'),
        'header_color': data.get('header_color', '#3b82f6'),
        'header_color_end': data.get('header_color_end', '#1d4ed8'),
        'border_radius': data.get('border_radius', 16),
        'show_branding': data.get('show_branding', True),
        'custom_css': data.get('custom_css'),
        'chat_url': data.get('chat_url')
    }
    
    widget_settings_json = json.dumps(widget_settings)
    
    # Обновляем widget_settings в JSONB для tenant_id=1
    cur.execute("""
        UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
        SET widget_settings = %s::jsonb,
            updated_at = CURRENT_TIMESTAMP
        WHERE tenant_id = 1
    """, (widget_settings_json,))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'success': True})
    }