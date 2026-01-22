-- Временно меняем провайдер на deepseek для tenant 2 (для теста после исправления)
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET ai_settings = jsonb_set(
    jsonb_set(
        jsonb_set(ai_settings, '{provider}', '"deepseek"'),
        '{chat_provider}', '"deepseek"'
    ),
    '{model}', '"deepseek-chat"'
),
updated_at = CURRENT_TIMESTAMP
WHERE tenant_id = 2;