-- Отключение согласия в мессенджерах для тенанта 2 (т.к. главный переключатель выключен)
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET consent_messenger_enabled = false
WHERE tenant_id = 2;
