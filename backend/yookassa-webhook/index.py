import json
import os
import psycopg2
import hashlib
import secrets
import string
import requests
from datetime import datetime, timedelta

SEND_EMAIL_URL = 'https://functions.poehali.dev/38938588-b119-4fcc-99d9-952e16dd8d6a'

def handler(event: dict, context) -> dict:
    """Webhook для получения уведомлений от ЮKassa о статусе платежей"""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }

    try:
        body = json.loads(event.get('body', '{}'))
        
        event_type = body.get('event')
        payment_object = body.get('object', {})
        
        payment_id = payment_object.get('id')
        status = payment_object.get('status')
        amount = payment_object.get('amount', {}).get('value')
        description = payment_object.get('description')

        if not payment_id:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }

        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')

        cur.execute(f"""
            INSERT INTO {schema}.payments (payment_id, status, amount, description, event_type, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (payment_id) 
            DO UPDATE SET status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP
        """, (payment_id, status, amount, description, event_type, datetime.utcnow()))

        conn.commit()
        
        # Если платеж успешный и это новое событие (succeeded), создаем тенант и пользователя
        if status == 'succeeded' and event_type == 'payment.succeeded':
            # Извлекаем данные из metadata платежа
            metadata = payment_object.get('metadata', {})
            tenant_name = metadata.get('tenant_name', description or 'New Tenant')
            tenant_slug = metadata.get('tenant_slug', f"tenant-{payment_id[:8]}")
            owner_email = metadata.get('owner_email')
            owner_phone = metadata.get('owner_phone', '')
            
            if owner_email:
                tariff_id = metadata.get('tariff_id', 'basic')
                first_month_included = metadata.get('first_month_included', False)
                
                # Вычисляем дату окончания подписки:
                # Если first_month_included=true, то первый платеж уже включает 1 месяц
                # Если false, то первый платеж = setup_fee, период не предоставляется
                if first_month_included:
                    subscription_end = datetime.utcnow() + timedelta(days=30)
                else:
                    # Setup fee без месяца - подписка истекает сразу
                    subscription_end = datetime.utcnow()
                
                # Создаем тенант
                cur.execute("""
                    INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenants 
                    (slug, name, description, owner_email, owner_phone, template_version, auto_update, status, 
                     is_public, subscription_status, subscription_end_date, tariff_id)
                    VALUES (%s, %s, %s, %s, %s, '1.0.0', false, 'active', true, 'active', %s, %s)
                    RETURNING id
                """, (tenant_slug, tenant_name, f'Создан после оплаты {payment_id}', owner_email, owner_phone, subscription_end, tariff_id))
                
                tenant_id = cur.fetchone()[0]
                
                # Копируем настройки из ШАБЛОНА (tenant_id=1: template)
                # Шаблон содержит все настройки по умолчанию: AI, промпт, виджет, мессенджеры, автосообщения
                cur.execute("""
                    SELECT ai_settings, widget_settings, messenger_settings, page_settings
                    FROM t_p56134400_telegram_ai_bot_pdf.tenant_settings
                    WHERE tenant_id = 1
                """)
                template_settings = cur.fetchone()
                
                if template_settings:
                    cur.execute("""
                        INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenant_settings 
                        (tenant_id, ai_settings, widget_settings, messenger_settings, page_settings)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (tenant_id, template_settings[0], template_settings[1], template_settings[2], template_settings[3]))
                else:
                    # Fallback: создаем пустую запись, если шаблон не найден
                    cur.execute("""
                        INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenant_settings (tenant_id)
                        VALUES (%s)
                    """, (tenant_id,))
                
                # Создаем пользователя
                username = f"{tenant_slug}_user"
                password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
                password_hash = hashlib.sha256(password.encode()).hexdigest()
                
                cur.execute("""
                    INSERT INTO t_p56134400_telegram_ai_bot_pdf.admin_users 
                    (username, password_hash, email, role, tenant_id, is_active, subscription_status, subscription_end_date, tariff_id)
                    VALUES (%s, %s, %s, 'content_editor', %s, true, 'active', %s, %s)
                    RETURNING id
                """, (username, password_hash, owner_email, tenant_id, subscription_end, tariff_id))
                
                user_id = cur.fetchone()[0]
                
                # Записываем платеж в таблицу подписок
                cur.execute("""
                    INSERT INTO t_p56134400_telegram_ai_bot_pdf.subscription_payments
                    (tenant_id, payment_id, amount, status, tariff_id, payment_type)
                    VALUES (%s, %s, %s, %s, %s, 'initial')
                """, (tenant_id, payment_id, amount, status, tariff_id))
                
                # Обновляем запись платежа с tenant_id
                cur.execute(f"""
                    UPDATE {schema}.payments 
                    SET description = description || ' | Tenant ID: ' || %s
                    WHERE payment_id = %s
                """, (tenant_id, payment_id))
                
                conn.commit()
                
                # Отправляем email уведомление через отдельный сервис
                tariff_names = {
                    'basic': 'Старт',
                    'professional': 'Бизнес',
                    'enterprise': 'Премиум'
                }
                
                # Формируем URL для входа
                login_url = f"https://ai-ru.ru/content-editor?tenant_id={tenant_id}"
                
                email_sent = send_order_notification(
                    customer_email=owner_email,
                    customer_name=metadata.get('tenant_name', ''),
                    customer_phone=owner_phone,
                    tariff_name=tariff_names.get(tariff_id, tariff_id),
                    amount=float(amount),
                    payment_id=payment_id,
                    tenant_slug=tenant_slug,
                    username=username,
                    password=password,
                    login_url=login_url
                )
                
                print(f'Tenant {tenant_id} and user {user_id} created for payment {payment_id}. Email sent: {email_sent}')
        
        cur.close()
        conn.close()

        print(f'Payment {payment_id} updated with status {status}')

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }

    except Exception as e:
        print(f'Webhook processing error: {e}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def send_welcome_email(to_email: str, username: str, password: str, tenant_id: int, cur) -> bool:
    """Отправка email с доступами после оплаты"""
    try:
        # Получаем SMTP настройки и шаблон
        cur.execute("""
            SELECT setting_key, setting_value 
            FROM t_p56134400_telegram_ai_bot_pdf.default_settings
            WHERE setting_key IN ('smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'email_template_welcome')
        """)
        settings_rows = cur.fetchall()
        settings = {row[0]: row[1] for row in settings_rows}
        
        smtp_host = settings.get('smtp_host', '').strip()
        smtp_port = int(settings.get('smtp_port', 465))
        smtp_user = settings.get('smtp_user', '').strip()
        smtp_password = settings.get('smtp_password', '').strip()
        email_template = settings.get('email_template_welcome', 'Здравствуйте!\n\nВаш логин: {username}\nВаш пароль: {password}')
        
        if not all([smtp_host, smtp_user, smtp_password]):
            print('SMTP настройки не полностью заполнены')
            return False
        
        login_url = f"https://your-domain.com/content-editor?tenant_id={tenant_id}"
        email_body = email_template.format(username=username, password=password, login_url=login_url)
        
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = to_email
        msg['Subject'] = 'Доступ к AI-консультанту - оплата подтверждена'
        msg.attach(MIMEText(email_body, 'plain', 'utf-8'))
        
        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port)
            server.starttls()
        
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
        
        print(f'Welcome email успешно отправлен на {to_email}')
        return True
    except Exception as e:
        print(f'Ошибка отправки welcome email: {str(e)}')
        return False

def send_order_notification(customer_email: str, customer_name: str, customer_phone: str, 
                           tariff_name: str, amount: float, payment_id: str, tenant_slug: str,
                           username: str = '', password: str = '', login_url: str = '') -> bool:
    """Отправка email уведомления через отдельный сервис"""
    try:
        response = requests.post(
            SEND_EMAIL_URL,
            json={
                'customer_email': customer_email,
                'customer_name': customer_name,
                'customer_phone': customer_phone,
                'tariff_name': tariff_name,
                'amount': amount,
                'payment_id': payment_id,
                'tenant_slug': tenant_slug,
                'username': username,
                'password': password,
                'login_url': login_url
            },
            timeout=10
        )
        
        if response.status_code == 200:
            print(f'Email notifications sent successfully for {customer_email}')
            return True
        else:
            print(f'Failed to send email: {response.text}')
            return False
    except Exception as e:
        print(f'Error sending email notification: {e}')
        return False