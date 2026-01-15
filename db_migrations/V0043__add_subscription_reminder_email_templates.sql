-- Добавляем шаблоны для напоминаний о подписке (3 уровня)
INSERT INTO t_p56134400_telegram_ai_bot_pdf.email_templates (template_key, subject, body, description)
VALUES 
(
    'subscription_reminder_7days',
    'Подписка истекает через 7 дней',
    '<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">Здравствуйте!</h1>
        
        <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
            Напоминаем, что ваша подписка на тариф <strong>{{tariff_name}}</strong> для проекта <strong>{{tenant_name}}</strong> 
            истекает через <strong style="color: #f59e0b;">7 дней</strong>.
        </p>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #92400e;">
                <strong>Стоимость продления:</strong> {{renewal_price}} ₽/месяц
            </p>
        </div>
        
        <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Чтобы продлить подписку и не потерять доступ к вашему AI-консультанту, перейдите в личный кабинет:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{renewal_url}}" style="background: #2563eb; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Продлить подписку
            </a>
        </div>
        
        <p style="color: #888; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            С уважением,<br>
            Команда поддержки
        </p>
    </div>
</body>
</html>',
    'Напоминание о подписке за 7 дней до истечения'
),
(
    'subscription_reminder_3days',
    '⚠️ Подписка истекает через 3 дня!',
    '<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin-bottom: 20px; text-align: center;">
            <h1 style="color: #f59e0b; font-size: 28px; margin: 0;">⚠️ Внимание!</h1>
        </div>
        
        <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
            Ваша подписка на тариф <strong>{{tariff_name}}</strong> для проекта <strong>{{tenant_name}}</strong> 
            истекает через <strong style="color: #f59e0b; font-size: 18px;">3 дня</strong>.
        </p>
        
        <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #991b1b;">
                <strong>Стоимость продления:</strong> {{renewal_price}} ₽/месяц
            </p>
        </div>
        
        <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Продлите подписку прямо сейчас, чтобы избежать прерывания работы вашего AI-консультанта!
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{renewal_url}}" style="background: #f59e0b; color: white; padding: 14px 36px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
                Продлить сейчас
            </a>
        </div>
        
        <p style="color: #888; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            С уважением,<br>
            Команда поддержки
        </p>
    </div>
</body>
</html>',
    'Критичное напоминание за 3 дня до истечения подписки'
),
(
    'subscription_reminder_1day',
    '🚨 Подписка истекает завтра!',
    '<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 3px solid #ef4444;">
        <div style="background: #fee2e2; padding: 20px; border-radius: 6px; margin-bottom: 20px; text-align: center;">
            <h1 style="color: #dc2626; font-size: 32px; margin: 0;">🚨 Критически важно!</h1>
        </div>
        
        <p style="color: #555; line-height: 1.6; margin-bottom: 15px; font-size: 16px;">
            Ваша подписка на тариф <strong>{{tariff_name}}</strong> для проекта <strong>{{tenant_name}}</strong> 
            истекает <strong style="color: #dc2626; font-size: 20px;">ЗАВТРА</strong>!
        </p>
        
        <div style="background: #fef2f2; border: 2px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 6px;">
            <p style="margin: 0 0 10px 0; color: #991b1b; font-size: 14px;">
                После истечения подписки доступ к AI-консультанту будет <strong>заблокирован</strong>.
            </p>
            <p style="margin: 0; color: #991b1b; font-size: 16px;">
                <strong>Стоимость продления:</strong> {{renewal_price}} ₽/месяц
            </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{renewal_url}}" style="background: #dc2626; color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                Продлить немедленно
            </a>
        </div>
        
        <p style="color: #dc2626; font-weight: bold; text-align: center; margin: 20px 0;">
            Не упустите возможность сохранить доступ!
        </p>
        
        <p style="color: #888; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            С уважением,<br>
            Команда поддержки
        </p>
    </div>
</body>
</html>',
    'Финальное критическое напоминание за 1 день до истечения'
);