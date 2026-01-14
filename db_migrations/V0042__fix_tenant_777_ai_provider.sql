-- Миграция старых настроек AI: установка provider = openrouter для tenant 777
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings 
SET ai_settings = jsonb_set(
    jsonb_set(ai_settings, '{provider}', '"openrouter"'), 
    '{model}', '"deepseek-r1"'
)
WHERE tenant_id = 777;
