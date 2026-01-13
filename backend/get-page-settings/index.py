import json
import os
import psycopg2
from auth_middleware import get_tenant_id_from_request

def handler(event: dict, context) -> dict:
    """Получение настроек страницы и быстрых вопросов"""
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

        # Получаем page_settings и public_description из JSONB
        cur.execute("""
            SELECT page_settings, public_description 
            FROM t_p56134400_telegram_ai_bot_pdf.tenant_settings
            WHERE tenant_id = %s
        """, (tenant_id,))
        row = cur.fetchone()
        settings = row[0] if row and row[0] else {}
        
        # Добавляем public_description в settings
        if row and row[1]:
            settings['public_description'] = row[1]

        cur.execute("""
            SELECT id, text, question, icon, sort_order
            FROM t_p56134400_telegram_ai_bot_pdf.quick_questions
            ORDER BY sort_order, id
        """)
        questions_rows = cur.fetchall()
        quick_questions = [
            {
                'id': row[0],
                'text': row[1],
                'question': row[2],
                'icon': row[3],
                'sort_order': row[4]
            }
            for row in questions_rows
        ]

        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'settings': settings,
                'quickQuestions': quick_questions
            }),
            'isBase64Encoded': False
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }