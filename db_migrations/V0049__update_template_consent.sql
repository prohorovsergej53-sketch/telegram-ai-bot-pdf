-- Update template bot (tenant_id=1) with default consent settings
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings 
SET 
  consent_enabled = true,
  consent_text = 'Я согласен на обработку персональных данных в соответствии с <a href="/privacy-policy" target="_blank" class="text-primary underline">Политикой конфиденциальности</a>',
  consent_messenger_text = 'Продолжая диалог, вы соглашаетесь на обработку персональных данных согласно нашей Политике конфиденциальности.'
WHERE tenant_id = 1;