import json
import os
import psycopg2
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    '''Отправка напоминаний о заканчивающейся подписке (за 7 и 3 дня)'''
    
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
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    # Подписки, заканчивающиеся через 7 дней
    seven_days_later = datetime.now() + timedelta(days=7)
    three_days_later = datetime.now() + timedelta(days=3)
    
    cur.execute("""
        SELECT s.id, s.tenant_id, s.expires_at, s.plan_type,
               t.name, t.slug, u.email
        FROM subscriptions s
        JOIN tenants t ON t.id = s.tenant_id
        LEFT JOIN users u ON u.id = t.owner_id
        WHERE s.status = 'active'
        AND s.expires_at BETWEEN NOW() AND %s
        AND s.reminder_7d_sent = FALSE
    """, (seven_days_later,))
    
    expiring_7d = cur.fetchall()
    sent_7d = []
    
    for sub in expiring_7d:
        sub_id, tenant_id, expires_at, plan_type, tenant_name, slug, email = sub
        
        if email:
            send_expiration_email(
                email=email,
                tenant_name=tenant_name,
                plan_type=plan_type,
                expires_at=expires_at,
                days_left=7
            )
            
            # Отметить как отправленное
            cur.execute("""
                UPDATE subscriptions 
                SET reminder_7d_sent = TRUE 
                WHERE id = %s
            """, (sub_id,))
            
            sent_7d.append({
                'tenant': tenant_name,
                'email': email,
                'expires_at': str(expires_at)
            })
    
    # Подписки, заканчивающиеся через 3 дня
    cur.execute("""
        SELECT s.id, s.tenant_id, s.expires_at, s.plan_type,
               t.name, t.slug, u.email
        FROM subscriptions s
        JOIN tenants t ON t.id = s.tenant_id
        LEFT JOIN users u ON u.id = t.owner_id
        WHERE s.status = 'active'
        AND s.expires_at BETWEEN NOW() AND %s
        AND s.reminder_3d_sent = FALSE
    """, (three_days_later,))
    
    expiring_3d = cur.fetchall()
    sent_3d = []
    
    for sub in expiring_3d:
        sub_id, tenant_id, expires_at, plan_type, tenant_name, slug, email = sub
        
        if email:
            send_expiration_email(
                email=email,
                tenant_name=tenant_name,
                plan_type=plan_type,
                expires_at=expires_at,
                days_left=3
            )
            
            cur.execute("""
                UPDATE subscriptions 
                SET reminder_3d_sent = TRUE 
                WHERE id = %s
            """, (sub_id,))
            
            sent_3d.append({
                'tenant': tenant_name,
                'email': email,
                'expires_at': str(expires_at)
            })
    
    conn.commit()
    cur.close()
    conn.close()
    
    result = {
        'status': 'success',
        'reminders_sent': {
            '7_days': len(sent_7d),
            '3_days': len(sent_3d)
        },
        'details': {
            '7_days_list': sent_7d,
            '3_days_list': sent_3d
        },
        'timestamp': datetime.now().isoformat()
    }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(result)
    }

def send_expiration_email(email: str, tenant_name: str, plan_type: str, expires_at, days_left: int):
    '''Отправка email через send-email функцию'''
    # Здесь можно вызвать send-email функцию через HTTP
    pass
