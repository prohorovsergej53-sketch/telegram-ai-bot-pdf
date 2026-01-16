-- Обновление существующего tenant_id=2 с правильными полями
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings 
SET ai_settings = ai_settings 
    || '{"chat_provider": "deepseek"}'::jsonb
    || '{"chat_model": "deepseek-chat"}'::jsonb
    || '{"embedding_provider": "openai"}'::jsonb
    || '{"embedding_model": "text-embedding-3-small"}'::jsonb
WHERE tenant_id = 2;