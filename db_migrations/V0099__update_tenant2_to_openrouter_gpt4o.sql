-- Обновление провайдера для tenant_id=2 на openrouter с моделью gpt-4o
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings 
SET ai_settings = jsonb_set(jsonb_set(ai_settings, '{chat_provider}', '"openrouter"'), '{chat_model}', '"gpt-4o"')
WHERE tenant_id = 2;