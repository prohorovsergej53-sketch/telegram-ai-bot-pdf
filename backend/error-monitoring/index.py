import json
import os
import psycopg2
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    '''Мониторинг ошибок и падений функций за последние 24 часа'''
    
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
    
    yesterday = datetime.now() - timedelta(days=1)
    
    # Ошибки в chat_messages (если есть поле error_log или status)
    cur.execute("""
        SELECT COUNT(*) FROM chat_messages 
        WHERE created_at >= %s 
        AND (message LIKE '%%error%%' OR message LIKE '%%failed%%')
    """, (yesterday,))
    chat_errors = cur.fetchone()[0]
    
    # Ошибки в system_monitoring за последние 24 часа
    cur.execute("""
        SELECT event_type, COUNT(*) as count
        FROM system_monitoring
        WHERE created_at >= %s
        AND event_type IN ('error', 'critical', 'warning')
        GROUP BY event_type
        ORDER BY count DESC
    """, (yesterday,))
    monitoring_errors = [{'type': row[0], 'count': row[1]} for row in cur.fetchall()]
    
    # Проблемные функции (если есть таблица function_logs)
    cur.execute("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'function_logs'
    """)
    has_function_logs = cur.fetchone() is not None
    
    function_errors = []
    if has_function_logs:
        cur.execute("""
            SELECT function_name, COUNT(*) as error_count
            FROM function_logs
            WHERE created_at >= %s
            AND status = 'error'
            GROUP BY function_name
            ORDER BY error_count DESC
            LIMIT 10
        """, (yesterday,))
        function_errors = [{'function': row[0], 'errors': row[1]} for row in cur.fetchall()]
    
    cur.close()
    conn.close()
    
    total_errors = chat_errors + sum(e['count'] for e in monitoring_errors)
    
    report = {
        'period': '24h',
        'timestamp': datetime.now().isoformat(),
        'total_errors': total_errors,
        'chat_errors': chat_errors,
        'monitoring_errors': monitoring_errors,
        'function_errors': function_errors,
        'alert_level': 'critical' if total_errors > 100 else 'warning' if total_errors > 10 else 'ok'
    }
    
    # Отправка алерта админам если критично
    if report['alert_level'] == 'critical':
        send_alert_to_admins(report)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(report)
    }

def send_alert_to_admins(report: dict):
    '''Отправка критических алертов админам'''
    admin_email = os.environ.get('ADMIN_EMAIL')
    if admin_email:
        # Здесь можно вызвать send-email или Telegram бота
        pass
