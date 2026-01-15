UPDATE t_p56134400_telegram_ai_bot_pdf.email_templates 
SET 
  subject = 'Добро пожаловать в AI Консьерж!',
  body = '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
  <h1 style="margin: 0;">🎉 Добро пожаловать!</h1>
</div>
<div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
  <p style="font-size: 16px; color: #374151;">Здравствуйте!</p>
  <p style="font-size: 16px; color: #374151; line-height: 1.6;">
    Ваш тариф <strong>{{ tariff_name }}</strong> успешно активирован! Теперь вы можете пользоваться всеми возможностями AI Консьержа.
  </p>
  
  <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
    <h3 style="margin-top: 0; color: #667eea;">📧 Данные для входа:</h3>
    <p style="margin: 5px 0;"><strong>Email:</strong> {{ email }}</p>
    <p style="margin: 5px 0;"><strong>Пароль:</strong> {{ password }}</p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{ login_url }}" style="display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
      Войти в личный кабинет
    </a>
  </div>
  
  <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
    Если у вас возникнут вопросы, мы всегда готовы помочь!
  </p>
  
  <p style="font-size: 14px; color: #9ca3af; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    С уважением,<br>Команда AI Консьерж
  </p>
</div>
</body></html>',
  updated_at = CURRENT_TIMESTAMP
WHERE template_key = 'tariff_created';