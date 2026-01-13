"""
Управление подписками - получение информации о тарифе и подписке клиента
"""
import json
import os
import psycopg2
from datetime import datetime
from decimal import Decimal

def handler(event: dict, context) -> dict:
    """Получение информации о подписке клиента"""
    
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
    
    query_params = event.get('queryStringParameters') or {}
    tenant_id = query_params.get('tenant_id')
    
    if not tenant_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'tenant_id обязателен'})
        }
    
    try:
        dsn = os.environ['DATABASE_URL']
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        # Получаем информацию о тенанте и его тарифе
        cur.execute("""
            SELECT 
                t.id,
                t.name,
                t.tariff_id,
                t.subscription_end_date,
                tar.name as tariff_name,
                tar.renewal_price,
                tar.period
            FROM tenants t
            LEFT JOIN tariff_plans tar ON t.tariff_id = tar.id
            WHERE t.id = %s
        """, (tenant_id,))
        
        row = cur.fetchone()
        
        if not row:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Клиент не найден'})
            }
        
        tenant_name, tariff_id, end_date, tariff_name, renewal_price, period = row[1], row[2], row[3], row[4], row[5], row[6]
        
        # Вычисляем статус и оставшиеся дни
        if end_date:
            # end_date уже datetime объект из БД
            if isinstance(end_date, str):
                end_datetime = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            else:
                end_datetime = end_date
            
            now = datetime.now()
            days_left = (end_datetime - now).days
            status = 'active' if days_left > 0 else 'expired'
            end_date_str = end_datetime.isoformat()
        else:
            days_left = 0
            status = 'no_subscription'
            end_date_str = None
        
        subscription = {
            'status': status,
            'end_date': end_date_str,
            'tariff_id': tariff_id,
            'tariff_name': tariff_name or 'Не указан',
            'renewal_price': float(renewal_price) if renewal_price is not None else 0,
            'days_left': max(0, days_left),
            'period': period or 'месяц'
        }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'subscription': subscription})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }