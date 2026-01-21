-- Переключаем tenant_id=2 на DeepSeek-R1 для лучшего понимания инструкций о датах

UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET ai_settings = jsonb_set(
  jsonb_set(
    COALESCE(ai_settings, '{}'::jsonb),
    '{chat_model}',
    '"deepseek-r1"'
  ),
  '{chat_provider}',
  '"openrouter"'
)
WHERE tenant_id = 2;
