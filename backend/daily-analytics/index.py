import json
import os
import psycopg2
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    '''Ежедневный отчёт по активности пользователей и тенантов'''
    
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
    
    yesterday = (datetime.now() - timedelta(days=1)).date()
    
    # Новые пользователи за вчера
    cur.execute("""
        SELECT COUNT(*) FROM users 
        WHERE DATE(created_at) = %s
    """, (yesterday,))
    new_users = cur.fetchone()[0]
    
    # Активные тенанты за вчера
    cur.execute("""
        SELECT COUNT(DISTINCT tenant_id) FROM chat_sessions 
        WHERE DATE(created_at) = %s
    """, (yesterday,))
    active_tenants = cur.fetchone()[0]
    
    # Всего сообщений за вчера
    cur.execute("""
        SELECT COUNT(*) FROM chat_messages 
        WHERE DATE(created_at) = %s
    """, (yesterday,))
    total_messages = cur.fetchone()[0]
    
    # Новые подписки за вчера
    cur.execute("""
        SELECT COUNT(*) FROM subscriptions 
        WHERE DATE(created_at) = %s
    """, (yesterday,))
    new_subscriptions = cur.fetchone()[0]
    
    # Топ 5 тенантов по активности
    cur.execute("""
        SELECT t.name, COUNT(cm.id) as msg_count
        FROM tenants t
        JOIN chat_sessions cs ON cs.tenant_id = t.id
        JOIN chat_messages cm ON cm.session_id = cs.id
        WHERE DATE(cm.created_at) = %s
        GROUP BY t.id, t.name
        ORDER BY msg_count DESC
        LIMIT 5
    """, (yesterday,))
    top_tenants = [{'name': row[0], 'messages': row[1]} for row in cur.fetchall()]
    
    cur.close()
    conn.close()
    
    report = {
        'date': str(yesterday),
        'new_users': new_users,
        'active_tenants': active_tenants,
        'total_messages': total_messages,
        'new_subscriptions': new_subscriptions,
        'top_tenants': top_tenants
    }
    
    # Отправка отчёта на email (если настроен)
    admin_email = os.environ.get('ADMIN_EMAIL')
    if admin_email:
        send_email_report(admin_email, report)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(report)
    }

def send_email_report(email: str, report: dict):
    '''Отправка отчёта на email через send-email функцию'''
    import requests
    
    html = f"""
    <h2>📊 Ежедневный отчёт за {report['date']}</h2>
    <ul>
        <li>👥 Новых пользователей: {report['new_users']}</li>
        <li>🏢 Активных тенантов: {report['active_tenants']}</li>
        <li>💬 Всего сообщений: {report['total_messages']}</li>
        <li>💳 Новых подписок: {report['new_subscriptions']}</li>
    </ul>
    <h3>🏆 Топ тенантов:</h3>
    <ol>
        {''.join([f"<li>{t['name']}: {t['messages']} сообщений</li>" for t in report['top_tenants']])}
    </ol>
    """
    
    # Здесь можно вызвать send-email функцию через HTTP
    pass
