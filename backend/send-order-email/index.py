import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def handler(event: dict, context) -> dict:
    """Отправка email-уведомлений после успешного заказа"""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }

    try:
        body_str = event.get('body', '{}')
        if not body_str or body_str == '':
            body_str = '{}'
        
        body = json.loads(body_str)
        
        # Данные заказа
        customer_email = body.get('customer_email', '')
        customer_name = body.get('customer_name', '')
        customer_phone = body.get('customer_phone', '')
        tariff_name = body.get('tariff_name', '')
        amount = body.get('amount', 0)
        payment_id = body.get('payment_id', '')
        tenant_slug = body.get('tenant_slug', '')
        
        if not customer_email:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'Email клиента обязателен'}),
                'isBase64Encoded': False
            }
        
        # Настройки SMTP
        smtp_host = os.environ.get('EMAIL_SMTP_HOST', '')
        smtp_port = int(os.environ.get('EMAIL_SMTP_PORT', '465'))
        smtp_user = os.environ.get('EMAIL_SMTP_USER', '')
        smtp_password = os.environ.get('EMAIL_SMTP_PASSWORD', '')
        
        if not all([smtp_host, smtp_user, smtp_password]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'SMTP настройки не заданы'}),
                'isBase64Encoded': False
            }
        
        # Email клиенту
        customer_msg = create_customer_email(customer_name, customer_email, tariff_name, amount, tenant_slug)
        send_email(smtp_host, smtp_port, smtp_user, smtp_password, customer_email, 'Подтверждение заказа AI-консультанта', customer_msg)
        
        # Email администратору
        admin_msg = create_admin_email(customer_name, customer_email, customer_phone, tariff_name, amount, payment_id, tenant_slug)
        send_email(smtp_host, smtp_port, smtp_user, smtp_password, smtp_user, f'Новый заказ: {tariff_name}', admin_msg)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'Уведомления отправлены'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        print(f'Error sending email: {e}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': str(e)}),
            'isBase64Encoded': False
        }

def send_email(host: str, port: int, user: str, password: str, to_email: str, subject: str, html_body: str):
    """Отправка email через SMTP"""
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = user
    msg['To'] = to_email
    
    html_part = MIMEText(html_body, 'html', 'utf-8')
    msg.attach(html_part)
    
    if port == 465:
        # SSL
        with smtplib.SMTP_SSL(host, port, timeout=10) as server:
            server.login(user, password)
            server.send_message(msg)
    else:
        # TLS
        with smtplib.SMTP(host, port, timeout=10) as server:
            server.starttls()
            server.login(user, password)
            server.send_message(msg)

def create_customer_email(name: str, email: str, tariff: str, amount: float, tenant_slug: str) -> str:
    """HTML шаблон письма клиенту"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .info {{ background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Заказ успешно оформлен!</h1>
            </div>
            <div class="content">
                <p>Здравствуйте{', ' + name if name else ''}!</p>
                
                <p>Благодарим за выбор нашего AI-консультанта для отелей.</p>
                
                <div class="info">
                    <h3>📋 Детали заказа:</h3>
                    <p><strong>Тариф:</strong> {tariff}</p>
                    <p><strong>Стоимость:</strong> {amount:,.0f} ₽</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Ваш проект:</strong> {tenant_slug}</p>
                </div>
                
                <p><strong>Что дальше?</strong></p>
                <ul>
                    <li>В течение 24 часов мы настроим ваш AI-консультант</li>
                    <li>Вы получите доступ к админ-панели для управления</li>
                    <li>Сможете загружать PDF с информацией об отеле</li>
                    <li>Настроить интеграции с мессенджерами</li>
                </ul>
                
                <p>Если у вас есть вопросы, ответим в течение нескольких часов:</p>
                <p>📧 Email: <a href="mailto:info@298100.ru">info@298100.ru</a><br>
                📱 Телефон: <a href="tel:+79787236035">+7 (978) 723-60-35</a></p>
            </div>
            <div class="footer">
                <p>С уважением, команда AI-консультант для отелей</p>
                <p>Республика Крым, г. Феодосия | ИНН: 910800040469</p>
            </div>
        </div>
    </body>
    </html>
    """

def create_admin_email(name: str, email: str, phone: str, tariff: str, amount: float, payment_id: str, tenant_slug: str) -> str:
    """HTML шаблон письма администратору"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #10b981; color: white; padding: 20px; border-radius: 5px; }}
            .content {{ padding: 20px; }}
            .info {{ background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>✅ Новый заказ: {tariff}</h2>
            </div>
            <div class="content">
                <div class="info">
                    <h3>Информация о клиенте:</h3>
                    <p><strong>Имя:</strong> {name or 'Не указано'}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Телефон:</strong> {phone}</p>
                </div>
                
                <div class="info">
                    <h3>Детали заказа:</h3>
                    <p><strong>Тариф:</strong> {tariff}</p>
                    <p><strong>Сумма:</strong> {amount:,.0f} ₽</p>
                    <p><strong>ID платежа:</strong> {payment_id}</p>
                    <p><strong>Slug проекта:</strong> {tenant_slug}</p>
                </div>
                
                <p><strong>Действия:</strong></p>
                <ul>
                    <li>Настроить проект в админке</li>
                    <li>Отправить клиенту данные для входа</li>
                    <li>Провести онбординг при необходимости</li>
                </ul>
            </div>
        </div>
    </body>
    </html>
    """
