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
    
    cur.execute("""
        UPDATE t_p56134400_telegram_ai_bot_pdf.widget_settings
        SET button_color = %s,
            button_color_end = %s,
            button_size = %s,
            button_position = %s,
            window_width = %s,
            window_height = %s,
            header_title = %s,
            header_color = %s,
            header_color_end = %s,
            border_radius = %s,
            show_branding = %s,
            custom_css = %s,
            chat_url = %s,
            updated_at = NOW()
        WHERE id = 1
    """, (
        data.get('button_color', '#667eea'),
        data.get('button_color_end', '#764ba2'),
        data.get('button_size', 60),
        data.get('button_position', 'bottom-right'),
        data.get('window_width', 380),
        data.get('window_height', 600),
        data.get('header_title', 'AI Ассистент'),
        data.get('header_color', '#667eea'),
        data.get('header_color_end', '#764ba2'),
        data.get('border_radius', 16),
        data.get('show_branding', True),
        data.get('custom_css'),
        data.get('chat_url')
    ))
    
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