import json
import os
import psycopg2
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    '''Удаление старых логов (старше 30 дней)'''
    
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
    
    cutoff_date = datetime.now() - timedelta(days=30)
    deleted_count = 0
    
    # Удаление старых логов из system_monitoring
    cur.execute("""
        DELETE FROM system_monitoring 
        WHERE created_at < %s 
        AND event_type NOT IN ('critical', 'error')
    """, (cutoff_date,))
    deleted_monitoring = cur.rowcount
    deleted_count += deleted_monitoring
    
    # Удаление старых consent_logs
    cur.execute("""
        DELETE FROM consent_logs 
        WHERE created_at < %s
    """, (cutoff_date,))
    deleted_consent = cur.rowcount
    deleted_count += deleted_consent
    
    # Удаление старых session_logs (если есть такая таблица)
    cur.execute("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'session_logs'
    """)
    has_session_logs = cur.fetchone() is not None
    
    deleted_sessions = 0
    if has_session_logs:
        cur.execute("""
            DELETE FROM session_logs 
            WHERE created_at < %s
        """, (cutoff_date,))
        deleted_sessions = cur.rowcount
        deleted_count += deleted_sessions
    
    # Удаление старых неактивных чат-сессий (без сообщений)
    cur.execute("""
        DELETE FROM chat_sessions 
        WHERE created_at < %s
        AND id NOT IN (SELECT DISTINCT session_id FROM chat_messages)
    """, (cutoff_date,))
    deleted_empty_sessions = cur.rowcount
    deleted_count += deleted_empty_sessions
    
    conn.commit()
    cur.close()
    conn.close()
    
    result = {
        'status': 'success',
        'deleted_total': deleted_count,
        'details': {
            'monitoring_logs': deleted_monitoring,
            'consent_logs': deleted_consent,
            'session_logs': deleted_sessions,
            'empty_chat_sessions': deleted_empty_sessions
        },
        'cutoff_date': str(cutoff_date.date()),
        'timestamp': datetime.now().isoformat()
    }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(result)
    }
