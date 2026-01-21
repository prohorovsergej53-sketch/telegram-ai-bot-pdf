-- Переключаем tenant_id=2 на GPT-4o через OpenRouter (мощная модель для сложных инструкций)

UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET ai_settings = jsonb_set(
  jsonb_set(
    COALESCE(ai_settings, '{}'::jsonb),
    '{chat_model}',
    '"gpt-4o"'
  ),
  '{chat_provider}',
  '"openrouter"'
)
WHERE tenant_id = 2;