import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    """API для управления тарифами и изменения тарифов клиентов (только для суперадмина)"""
    method = event.get('httpMethod', 'GET')
    action = event.get('queryStringParameters', {}).get('action', '')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }

    try:
        # Проверка авторизации суперадмина
        auth_header = event.get('headers', {}).get('X-Authorization', '')
        if not auth_header.startswith('Bearer '):
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized'}),
                'isBase64Encoded': False
            }

        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        schema = 't_p56134400_telegram_ai_bot_pdf'

        # Смена тарифа для тенанта (суперадмин)
        if method == 'POST' and action == 'change_tariff':
            body = json.loads(event.get('body', '{}'))
            tenant_id = body.get('tenant_id')
            new_tariff_id = body.get('new_tariff_id')
            
            if not tenant_id or not new_tariff_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'tenant_id и new_tariff_id обязательны'}),
                    'isBase64Encoded': False
                }
            
            # Обновляем тариф у тенанта и его владельца
            cur.execute(f"""
                UPDATE {schema}.tenants
                SET tariff_id = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (new_tariff_id, tenant_id))
            
            cur.execute(f"""
                UPDATE {schema}.admin_users
                SET tariff_id = %s, updated_at = CURRENT_TIMESTAMP
                WHERE tenant_id = %s AND role = 'content_editor'
            """, (new_tariff_id, tenant_id))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': f'Тариф изменен на {new_tariff_id}'}),
                'isBase64Encoded': False
            }

        if method == 'GET':
            # Получить все тарифы
            cur.execute(f"""
                SELECT id, name, price, period, features, is_popular, is_active, 
                       sort_order, renewal_price, setup_fee, created_at, updated_at
                FROM {schema}.tariff_plans
                ORDER BY sort_order
            """)
            
            columns = ['id', 'name', 'price', 'period', 'features', 'is_popular', 
                      'is_active', 'sort_order', 'renewal_price', 'setup_fee', 
                      'created_at', 'updated_at']
            rows = cur.fetchall()
            
            tariffs = []
            for row in rows:
                tariff = dict(zip(columns, row))
                tariff['price'] = float(tariff['price']) if tariff['price'] else 0
                tariff['renewal_price'] = float(tariff['renewal_price']) if tariff['renewal_price'] else 0
                tariff['setup_fee'] = float(tariff['setup_fee']) if tariff['setup_fee'] else 0
                tariff['created_at'] = tariff['created_at'].isoformat() if tariff['created_at'] else None
                tariff['updated_at'] = tariff['updated_at'].isoformat() if tariff['updated_at'] else None
                tariffs.append(tariff)
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'tariffs': tariffs}),
                'isBase64Encoded': False
            }

        elif method == 'PUT':
            # Обновить тариф
            body = json.loads(event.get('body', '{}'))
            tariff_id = body.get('id')
            
            if not tariff_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Tariff ID is required'}),
                    'isBase64Encoded': False
                }
            
            # Собираем поля для обновления
            update_fields = []
            params = []
            
            if 'name' in body:
                update_fields.append('name = %s')
                params.append(body['name'])
            
            if 'price' in body:
                update_fields.append('price = %s')
                params.append(body['price'])
            
            if 'period' in body:
                update_fields.append('period = %s')
                params.append(body['period'])
            
            if 'features' in body:
                update_fields.append('features = %s')
                params.append(json.dumps(body['features']))
            
            if 'is_popular' in body:
                update_fields.append('is_popular = %s')
                params.append(body['is_popular'])
            
            if 'is_active' in body:
                update_fields.append('is_active = %s')
                params.append(body['is_active'])
            
            if 'sort_order' in body:
                update_fields.append('sort_order = %s')
                params.append(body['sort_order'])
            
            if 'renewal_price' in body:
                update_fields.append('renewal_price = %s')
                params.append(body['renewal_price'])
            
            if 'setup_fee' in body:
                update_fields.append('setup_fee = %s')
                params.append(body['setup_fee'])
            
            if not update_fields:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'No fields to update'}),
                    'isBase64Encoded': False
                }
            
            update_fields.append('updated_at = CURRENT_TIMESTAMP')
            params.append(tariff_id)
            
            query = f"""
                UPDATE {schema}.tariff_plans
                SET {', '.join(update_fields)}
                WHERE id = %s
            """
            
            cur.execute(query, params)
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': f'Tariff {tariff_id} updated'}),
                'isBase64Encoded': False
            }

        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }

    except Exception as e:
        print(f'Error in tariff management: {e}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }