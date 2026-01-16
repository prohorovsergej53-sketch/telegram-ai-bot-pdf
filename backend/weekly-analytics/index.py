import json
import os
import psycopg2
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    """Еженедельный отчёт по аналитике всех тенантов"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }

    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        week_ago = datetime.utcnow() - timedelta(days=7)
        
        cur.execute("""
            SELECT 
                COUNT(*) as total_tenants,
                SUM(CASE WHEN subscription_status = 'active' THEN 1 ELSE 0 END) as active_tenants,
                SUM(CASE WHEN subscription_status = 'expired' THEN 1 ELSE 0 END) as expired_tenants
            FROM t_p56134400_telegram_ai_bot_pdf.tenants
        """)
        tenants_stats = cur.fetchone()
        
        cur.execute("""
            SELECT COUNT(*) 
            FROM t_p56134400_telegram_ai_bot_pdf.chat_messages
            WHERE created_at >= %s
        """, (week_ago,))
        messages_count = cur.fetchone()[0]
        
        cur.execute("""
            SELECT setting_key, setting_value 
            FROM t_p56134400_telegram_ai_bot_pdf.default_settings
            WHERE setting_key IN ('smtp_host', 'smtp_port', 'smtp_user', 'smtp_password')
        """)
        smtp_settings = {row[0]: row[1] for row in cur.fetchall()}
        
        if not smtp_settings.get('smtp_host') or not smtp_settings.get('smtp_user'):
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'ok': True,
                    'total_tenants': tenants_stats[0],
                    'active_tenants': tenants_stats[1],
                    'messages_last_week': messages_count,
                    'message': 'SMTP не настроен, отчёт не отправлен'
                }),
                'isBase64Encoded': False
            }
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Еженедельный отчёт AI-консьержа</h2>
            <p><strong>Период:</strong> {week_ago.strftime('%d.%m.%Y')} - {datetime.utcnow().strftime('%d.%m.%Y')}</p>
            
            <h3>Статистика тенантов</h3>
            <ul>
                <li>Всего тенантов: {tenants_stats[0]}</li>
                <li>Активных: {tenants_stats[1]}</li>
                <li>Истекших: {tenants_stats[2]}</li>
            </ul>
            
            <h3>Активность</h3>
            <ul>
                <li>Сообщений за неделю: {messages_count}</li>
            </ul>
        </body>
        </html>
        """
        
        msg = MIMEMultipart('alternative')
        msg['From'] = smtp_settings.get('smtp_user', '')
        msg['To'] = smtp_settings.get('smtp_user', '')
        msg['Subject'] = f'Еженедельный отчёт AI-консьержа ({datetime.utcnow().strftime("%d.%m.%Y")})'
        msg.attach(MIMEText(html_body, 'html', 'utf-8'))
        
        smtp_port = int(smtp_settings.get('smtp_port', 465))
        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_settings['smtp_host'], smtp_port)
        else:
            server = smtplib.SMTP(smtp_settings['smtp_host'], smtp_port)
            server.starttls()
        
        server.login(smtp_settings['smtp_user'], smtp_settings['smtp_password'])
        server.send_message(msg)
        server.quit()
        
        cur.close()
        conn.close()
        
        result = {
            'ok': True,
            'total_tenants': tenants_stats[0],
            'active_tenants': tenants_stats[1],
            'messages_last_week': messages_count,
            'message': 'Отчёт отправлен на email'
        }
        
        print(f'Weekly report sent: {json.dumps(result)}')
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result),
            'isBase64Encoded': False
        }

    except Exception as e:
        print(f'Error sending weekly report: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }