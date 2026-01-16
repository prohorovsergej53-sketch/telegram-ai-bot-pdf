import json
import os
import psycopg2
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    '''Уведомления админам о важных событиях системы'''
    
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
    
    alerts = []
    
    # Проверка 1: Новые платные подписки за сутки
    cur.execute("""
        SELECT COUNT(*) FROM subscriptions 
        WHERE created_at >= NOW() - INTERVAL '24 hours'
        AND plan_type IN ('pro', 'premium', 'enterprise')
    """)
    new_paid_subs = cur.fetchone()[0]
    if new_paid_subs > 0:
        alerts.append({
            'type': 'revenue',
            'priority': 'high',
            'message': f'Новых платных подписок: {new_paid_subs}'
        })
    
    # Проверка 2: Критические ошибки
    cur.execute("""
        SELECT COUNT(*) FROM system_monitoring 
        WHERE created_at >= NOW() - INTERVAL '24 hours'
        AND event_type = 'critical'
    """)
    critical_errors = cur.fetchone()[0]
    if critical_errors > 0:
        alerts.append({
            'type': 'error',
            'priority': 'critical',
            'message': f'Критических ошибок за 24ч: {critical_errors}'
        })
    
    # Проверка 3: Падение активности (меньше 10 сообщений за час)
    cur.execute("""
        SELECT COUNT(*) FROM chat_messages 
        WHERE created_at >= NOW() - INTERVAL '1 hour'
    """)
    messages_last_hour = cur.fetchone()[0]
    if messages_last_hour < 10:
        alerts.append({
            'type': 'activity',
            'priority': 'warning',
            'message': f'Низкая активность: {messages_last_hour} сообщений за час'
        })
    
    # Проверка 4: Истекающие подписки сегодня
    cur.execute("""
        SELECT COUNT(*) FROM subscriptions 
        WHERE DATE(expires_at) = CURRENT_DATE
        AND status = 'active'
    """)
    expiring_today = cur.fetchone()[0]
    if expiring_today > 0:
        alerts.append({
            'type': 'subscription',
            'priority': 'medium',
            'message': f'Подписок истекает сегодня: {expiring_today}'
        })
    
    # Проверка 5: Размер БД превышает порог
    cur.execute("""
        SELECT pg_database_size(current_database()) as size
    """)
    db_size_bytes = cur.fetchone()[0]
    db_size_mb = round(db_size_bytes / 1024 / 1024, 2)
    
    if db_size_mb > 1000:  # 1 GB
        alerts.append({
            'type': 'storage',
            'priority': 'high',
            'message': f'Размер БД: {db_size_mb} MB (превышен порог 1GB)'
        })
    
    # Проверка 6: Новые регистрации за сутки
    cur.execute("""
        SELECT COUNT(*) FROM users 
        WHERE created_at >= NOW() - INTERVAL '24 hours'
    """)
    new_users = cur.fetchone()[0]
    if new_users > 10:
        alerts.append({
            'type': 'growth',
            'priority': 'high',
            'message': f'Новых пользователей за сутки: {new_users}'
        })
    
    cur.close()
    conn.close()
    
    # Отправка алертов админам
    admin_email = os.environ.get('ADMIN_EMAIL')
    if admin_email and alerts:
        send_admin_alert_email(admin_email, alerts)
    
    result = {
        'status': 'success',
        'alerts_count': len(alerts),
        'alerts': alerts,
        'timestamp': datetime.now().isoformat()
    }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(result)
    }

def send_admin_alert_email(email: str, alerts: list):
    '''Отправка email с алертами админам'''
    critical_count = len([a for a in alerts if a['priority'] == 'critical'])
    high_count = len([a for a in alerts if a['priority'] == 'high'])
    
    html = f"""
    <h2>🚨 Системные алерты</h2>
    <p><strong>Критических:</strong> {critical_count} | <strong>Важных:</strong> {high_count}</p>
    <ul>
        {''.join([f"<li>[{a['priority'].upper()}] {a['type']}: {a['message']}</li>" for a in alerts])}
    </ul>
    """
    # Здесь можно вызвать send-email функцию
    pass
