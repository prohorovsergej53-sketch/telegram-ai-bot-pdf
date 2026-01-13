import json
import os
import psycopg2
from auth_middleware import get_tenant_id_from_request

def handler(event: dict, context) -> dict:
    '''Получение настроек виджета для встраивания на сайт'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': ''
        }
    
    try:
        tenant_id, auth_error = get_tenant_id_from_request(event)
        if auth_error:
            return auth_error

        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        # Получаем widget_settings из JSONB
        cur.execute("""
            SELECT widget_settings
            FROM t_p56134400_telegram_ai_bot_pdf.tenant_settings
            WHERE tenant_id = %s
        """, (tenant_id,))
        
        result = cur.fetchone()
        cur.close()
        conn.close()
        
        if result and result[0]:
            settings = result[0]
        else:
            settings = {
                'button_color': '#3b82f6',
                'button_color_end': '#1d4ed8',
                'button_size': 60,
                'button_position': 'bottom-right',
                'button_icon': 'MessageCircle',
                'window_width': 380,
                'window_height': 600,
                'header_title': 'AI Ассистент',
                'header_color': '#3b82f6',
                'header_color_end': '#1d4ed8',
                'border_radius': 16,
                'show_branding': True,
                'custom_css': None,
                'chat_url': None
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(settings),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }