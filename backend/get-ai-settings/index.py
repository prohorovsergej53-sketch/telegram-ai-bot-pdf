import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """Получение настроек AI провайдеров"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
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
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()

        cur.execute("""
            SELECT model, temperature, top_p, frequency_penalty, 
                   presence_penalty, max_tokens, system_priority, creative_mode
            FROM t_p56134400_telegram_ai_bot_pdf.ai_model_settings
            LIMIT 1
        """)
        
        row = cur.fetchone()
        if row:
            settings = {
                'model': row[0],
                'temperature': float(row[1]),
                'top_p': float(row[2]),
                'frequency_penalty': float(row[3]),
                'presence_penalty': float(row[4]),
                'max_tokens': int(row[5]),
                'system_priority': row[6],
                'creative_mode': row[7]
            }
        else:
            settings = {
                'model': 'yandexgpt',
                'temperature': 0.15,
                'top_p': 1.0,
                'frequency_penalty': 0,
                'presence_penalty': 0,
                'max_tokens': 600,
                'system_priority': 'strict',
                'creative_mode': 'off'
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