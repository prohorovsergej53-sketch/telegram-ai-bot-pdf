import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''Получение настроек виджета для встраивания на сайт'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT button_color, button_color_end, button_size, button_position,
               window_width, window_height, header_title, header_color, 
               header_color_end, border_radius, show_branding, custom_css
        FROM t_p56134400_telegram_ai_bot_pdf.widget_settings
        WHERE id = 1
    """)
    
    result = cur.fetchone()
    cur.close()
    conn.close()
    
    if result:
        settings = {
            'button_color': result[0],
            'button_color_end': result[1],
            'button_size': result[2],
            'button_position': result[3],
            'window_width': result[4],
            'window_height': result[5],
            'header_title': result[6],
            'header_color': result[7],
            'header_color_end': result[8],
            'border_radius': result[9],
            'show_branding': result[10],
            'custom_css': result[11]
        }
    else:
        settings = {
            'button_color': '#667eea',
            'button_color_end': '#764ba2',
            'button_size': 60,
            'button_position': 'bottom-right',
            'window_width': 380,
            'window_height': 600,
            'header_title': 'AI Ассистент',
            'header_color': '#667eea',
            'header_color_end': '#764ba2',
            'border_radius': 16,
            'show_branding': True,
            'custom_css': None
        }
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(settings)
    }