-- Отключаем 152-ФЗ у всех тенантов, у которых он включен
UPDATE t_p56134400_telegram_ai_bot_pdf.tenants
SET fz152_enabled = false
WHERE fz152_enabled = true;

-- Отключаем все consent флаги у всех тенантов
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET 
    consent_webchat_enabled = false,
    consent_messenger_enabled = false,
    updated_at = CURRENT_TIMESTAMP
WHERE consent_webchat_enabled = true OR consent_messenger_enabled = true;