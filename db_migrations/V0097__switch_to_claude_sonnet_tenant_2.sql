-- Переключаем tenant_id=2 на Claude 3.5 Sonnet (лучшая модель для сложных инструкций)

UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET ai_settings = jsonb_set(
  jsonb_set(
    COALESCE(ai_settings, '{}'::jsonb),
    '{chat_model}',
    '"claude-3-5-sonnet-20241022"'
  ),
  '{chat_provider}',
  '"proxyapi"'
)
WHERE tenant_id = 2;