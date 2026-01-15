-- Обновляем шаблон письма для новых клиентов после создания тарифа
UPDATE email_templates 
SET 
    subject = '🎉 Добро пожаловать! Ваш AI-консультант готов к работе',
    body = '<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Заголовок -->
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; font-size: 28px; margin: 0 0 10px 0;">🚀 Ваш AI-консультант активирован!</h1>
            <p style="color: #64748b; font-size: 16px; margin: 0;">Спасибо за выбор нашего сервиса</p>
        </div>

        <!-- Приветствие -->
        <p style="color: #334155; line-height: 1.6; font-size: 16px; margin-bottom: 25px;">
            Здравствуйте! Ваша подписка успешно активирована. Ниже вы найдете данные для входа в административную панель.
        </p>

        <!-- Блок с доступами -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 10px; margin: 25px 0;">
            <h2 style="color: white; font-size: 20px; margin: 0 0 20px 0; text-align: center;">🔑 Ваши данные для входа</h2>
            
            <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">ЛОГИН (EMAIL):</p>
                <p style="margin: 0; color: #1e293b; font-size: 18px; font-family: monospace; font-weight: bold;">{{email}}</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 8px;">
                <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">ПАРОЛЬ:</p>
                <p style="margin: 0; color: #1e293b; font-size: 18px; font-family: monospace; font-weight: bold; letter-spacing: 2px;">{{password}}</p>
            </div>
        </div>

        <!-- Кнопка входа -->
        <div style="text-align: center; margin: 35px 0;">
            <a href="{{login_url}}" style="background: #2563eb; color: white; padding: 16px 48px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                Войти в админ-панель →
            </a>
        </div>

        <!-- Важная информация -->
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 6px;">
            <p style="margin: 0 0 10px 0; color: #92400e; font-weight: bold; font-size: 15px;">⚠️ Важно:</p>
            <ul style="margin: 0; padding-left: 20px; color: #92400e; line-height: 1.8;">
                <li>Сохраните эти данные в надежном месте</li>
                <li>Не передавайте пароль третьим лицам</li>
                <li>Вы можете изменить пароль в настройках</li>
            </ul>
        </div>

        <!-- Что дальше -->
        <div style="margin: 30px 0;">
            <h3 style="color: #1e293b; font-size: 18px; margin: 0 0 15px 0;">📋 Следующие шаги:</h3>
            <ol style="color: #475569; line-height: 2; padding-left: 20px; margin: 0;">
                <li><strong>Войдите в админ-панель</strong> по кнопке выше</li>
                <li><strong>Загрузите документы</strong> с информацией о вашем бизнесе (PDF)</li>
                <li><strong>Настройте мессенджеры</strong> (Telegram, WhatsApp, VK)</li>
                <li><strong>Протестируйте</strong> консультанта на типовых вопросах</li>
                <li><strong>Запустите</strong> для ваших клиентов!</li>
            </ol>
        </div>

        <!-- Нужна помощь -->
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 12px 0;">💬 Нужна помощь?</h3>
            <p style="color: #475569; margin: 0 0 10px 0; line-height: 1.6;">
                Наша команда всегда готова помочь:
            </p>
            <p style="margin: 5px 0;">
                <a href="https://t.me/+QgiLIa1gFRY4Y2Iy" style="color: #2563eb; text-decoration: none;">📱 Telegram-чат поддержки</a>
            </p>
            <p style="margin: 5px 0;">
                <a href="mailto:info@298100.ru" style="color: #2563eb; text-decoration: none;">✉️ info@298100.ru</a>
            </p>
        </div>

        <!-- Футер -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px 0;">
                AI-консультант для отелей
            </p>
            <p style="color: #cbd5e1; font-size: 12px; margin: 0;">
                Это автоматическое письмо. Пожалуйста, не отвечайте на него.
            </p>
        </div>

    </div>
</body>
</html>',
    updated_at = CURRENT_TIMESTAMP
WHERE template_key = 'tariff_created';
