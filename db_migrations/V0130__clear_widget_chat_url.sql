-- Очистить chat_url из widget_settings для всех tenants
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET widget_settings = jsonb_set(
    widget_settings,
    '{chat_url}',
    'null'::jsonb
)
WHERE widget_settings ? 'chat_url';