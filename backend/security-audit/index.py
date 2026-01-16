import json
import os
import psycopg2
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    '''Аудит безопасности: подозрительная активность, аномалии'''
    
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
    
    security_alerts = []
    
    # Проверка 1: Множественные неудачные попытки входа
    cur.execute("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'login_attempts'
    """)
    has_login_attempts = cur.fetchone() is not None
    
    if has_login_attempts:
        cur.execute("""
            SELECT email, COUNT(*) as attempts
            FROM login_attempts
            WHERE created_at >= NOW() - INTERVAL '1 hour'
            AND success = FALSE
            GROUP BY email
            HAVING COUNT(*) > 5
        """)
        failed_logins = cur.fetchall()
        if failed_logins:
            security_alerts.append({
                'type': 'brute_force_attempt',
                'priority': 'critical',
                'count': len(failed_logins),
                'description': f'{len(failed_logins)} аккаунтов с множественными неудачными попытками входа',
                'affected_emails': [e[0] for e in failed_logins[:5]]
            })
    
    # Проверка 2: Аномально высокое потребление API
    cur.execute("""
        SELECT t.id, t.name, COUNT(cm.id) as msg_count
        FROM tenants t
        JOIN chat_sessions cs ON cs.tenant_id = t.id
        JOIN chat_messages cm ON cm.session_id = cs.id
        WHERE cm.created_at >= NOW() - INTERVAL '1 hour'
        GROUP BY t.id, t.name
        HAVING COUNT(cm.id) > 1000
    """)
    high_usage = cur.fetchall()
    if high_usage:
        security_alerts.append({
            'type': 'api_abuse',
            'priority': 'high',
            'count': len(high_usage),
            'description': f'{len(high_usage)} тенантов с аномально высокой активностью (>1000 запросов/час)',
            'tenants': [{'id': t[0], 'name': t[1], 'messages': t[2]} for t in high_usage]
        })
    
    # Проверка 3: Подозрительные SQL инъекции в сообщениях
    cur.execute("""
        SELECT COUNT(*) FROM chat_messages
        WHERE created_at >= NOW() - INTERVAL '24 hours'
        AND (
            message LIKE '%DROP TABLE%'
            OR message LIKE '%DELETE FROM%'
            OR message LIKE '%UNION SELECT%'
            OR message LIKE '%<script>%'
        )
    """)
    injection_attempts = cur.fetchone()[0]
    if injection_attempts > 0:
        security_alerts.append({
            'type': 'injection_attempt',
            'priority': 'critical',
            'count': injection_attempts,
            'description': f'{injection_attempts} подозрительных сообщений с SQL/XSS паттернами'
        })
    
    # Проверка 4: Новые админы за последние 24 часа
    cur.execute("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admins'
    """)
    has_admins_table = cur.fetchone() is not None
    
    if has_admins_table:
        cur.execute("""
            SELECT COUNT(*) FROM admins
            WHERE created_at >= NOW() - INTERVAL '24 hours'
        """)
        new_admins = cur.fetchone()[0]
        if new_admins > 0:
            security_alerts.append({
                'type': 'privilege_escalation',
                'priority': 'critical',
                'count': new_admins,
                'description': f'{new_admins} новых админов за последние 24 часа'
            })
    
    # Проверка 5: Множественные IP для одного пользователя
    cur.execute("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_sessions'
    """)
    has_sessions = cur.fetchone() is not None
    
    if has_sessions:
        cur.execute("""
            SELECT user_id, COUNT(DISTINCT ip_address) as ip_count
            FROM user_sessions
            WHERE last_activity >= NOW() - INTERVAL '1 hour'
            GROUP BY user_id
            HAVING COUNT(DISTINCT ip_address) > 5
        """)
        multi_ip_users = cur.fetchall()
        if multi_ip_users:
            security_alerts.append({
                'type': 'account_sharing',
                'priority': 'medium',
                'count': len(multi_ip_users),
                'description': f'{len(multi_ip_users)} пользователей с множественными IP за час'
            })
    
    # Проверка 6: Удаление большого количества данных
    cur.execute("""
        SELECT COUNT(*) FROM system_monitoring
        WHERE created_at >= NOW() - INTERVAL '24 hours'
        AND event_type = 'bulk_delete'
        AND metadata::text LIKE '%rows_affected%'
    """)
    bulk_deletes = cur.fetchone()[0]
    if bulk_deletes > 0:
        security_alerts.append({
            'type': 'data_deletion',
            'priority': 'high',
            'count': bulk_deletes,
            'description': f'{bulk_deletes} массовых удалений данных за 24 часа'
        })
    
    cur.close()
    conn.close()
    
    result = {
        'status': 'ok' if not security_alerts else 'alerts_found',
        'alerts_count': len(security_alerts),
        'critical_count': len([a for a in security_alerts if a['priority'] == 'critical']),
        'alerts': security_alerts,
        'timestamp': datetime.now().isoformat()
    }
    
    # Отправка критических алертов админам немедленно
    critical_alerts = [a for a in security_alerts if a['priority'] == 'critical']
    if critical_alerts:
        send_security_alert(critical_alerts)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(result)
    }

def send_security_alert(alerts: list):
    '''Отправка критических security алертов админам'''
    pass
