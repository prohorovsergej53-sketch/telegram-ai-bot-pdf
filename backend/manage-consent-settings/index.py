import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """Управление настройками согласия 152-ФЗ и публичным контентом"""
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters') or {}
    action = query_params.get('action', '')
    tenant_id = query_params.get('tenant_id')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }

    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()

        if method == 'GET' and action == 'public_content' and tenant_id:
            cur.execute("""
                SELECT 
                    t.name,
                    ts.public_description,
                    ts.consent_enabled,
                    ts.consent_text,
                    ts.consent_messenger_text
                FROM t_p56134400_telegram_ai_bot_pdf.tenants t
                LEFT JOIN t_p56134400_telegram_ai_bot_pdf.tenant_settings ts ON t.id = ts.tenant_id
                WHERE t.id = %s
            """, (tenant_id,))
            
            row = cur.fetchone()
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Tenant not found'}),
                    'isBase64Encoded': False
                }

            result = {
                'name': row[0] or '',
                'public_description': row[1] or '',
                'consent_settings': {
                    'enabled': row[2] if row[2] is not None else False,
                    'text': row[3] or 'Я согласен на обработку персональных данных в соответствии с Политикой конфиденциальности',
                    'messenger_text': row[4] or 'Продолжая диалог, вы соглашаетесь на обработку персональных данных согласно нашей Политике конфиденциальности.'
                },
                'welcome_text': '',
                'faq': [],
                'contact_info': {'phone': '', 'email': '', 'address': ''}
            }

            cur.close()
            conn.close()

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }

        elif method == 'PUT' and action == 'public_content' and tenant_id:
            body = json.loads(event.get('body', '{}'))
            consent_settings = body.get('consent_settings', {})

            cur.execute("""
                UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
                SET 
                    public_description = %s,
                    consent_enabled = %s,
                    consent_text = %s,
                    consent_messenger_text = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE tenant_id = %s
            """, (
                body.get('public_description', ''),
                consent_settings.get('enabled', False),
                consent_settings.get('text', ''),
                consent_settings.get('messenger_text', ''),
                tenant_id
            ))

            conn.commit()
            cur.close()
            conn.close()

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }

        elif method == 'GET' and action == 'global_consent_settings':
            default_settings = {
                'enabled': False,
                'text': 'Я согласен на обработку персональных данных в соответствии с Политикой конфиденциальности'
            }

            cur.close()
            conn.close()

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(default_settings),
                'isBase64Encoded': False
            }

        elif method == 'PUT' and action == 'global_consent_settings':
            body = json.loads(event.get('body', '{}'))
            
            cur.close()
            conn.close()

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'Global settings updated'}),
                'isBase64Encoded': False
            }

        else:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action or missing parameters'}),
                'isBase64Encoded': False
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }