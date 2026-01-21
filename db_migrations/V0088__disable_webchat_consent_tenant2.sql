-- Отключение чекбокса согласия в веб-чате для тенанта 2
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET consent_webchat_enabled = false
WHERE tenant_id = 2;
