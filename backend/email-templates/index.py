import json
import os
import psycopg2
from typing import Optional

def handler(event: dict, context) -> dict:
    '''Управление email-шаблонами: получение списка, обновление, отправка тестовых писем'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            cur.execute('''
                SELECT id, template_key, subject, body, description, 
                       created_at, updated_at 
                FROM email_templates 
                ORDER BY template_key
            ''')
            rows = cur.fetchall()
            templates = []
            for row in rows:
                templates.append({
                    'id': row[0],
                    'template_key': row[1],
                    'subject': row[2],
                    'body': row[3],
                    'description': row[4],
                    'created_at': row[5].isoformat() if row[5] else None,
                    'updated_at': row[6].isoformat() if row[6] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'templates': templates}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            template_id = body.get('id')
            subject = body.get('subject')
            body_text = body.get('body')
            
            if not template_id or not subject or not body_text:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing required fields: id, subject, body'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                UPDATE email_templates 
                SET subject = %s, body = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, template_key, subject, body, description, updated_at
            ''', (subject, body_text, template_id))
            
            row = cur.fetchone()
            if not row:
                conn.rollback()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Template not found'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'template': {
                        'id': row[0],
                        'template_key': row[1],
                        'subject': row[2],
                        'body': row[3],
                        'description': row[4],
                        'updated_at': row[5].isoformat() if row[5] else None
                    }
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'test':
                template_id = body.get('template_id')
                test_email = body.get('test_email')
                test_data = body.get('test_data', {})
                
                if not template_id or not test_email:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing template_id or test_email'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute('SELECT subject, body FROM email_templates WHERE id = %s', (template_id,))
                row = cur.fetchone()
                
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Template not found'}),
                        'isBase64Encoded': False
                    }
                
                subject, body_html = row
                
                for key, value in test_data.items():
                    subject = subject.replace(f'{{{{{key}}}}}', str(value))
                    body_html = body_html.replace(f'{{{{{key}}}}}', str(value))
                
                from email_utils import send_email
                result = send_email(test_email, subject, body_html)
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unknown action'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()