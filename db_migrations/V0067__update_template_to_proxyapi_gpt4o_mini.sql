-- Обновление шаблона (tenant_id=1): провайдер ProxyAPI, модель GPT-4o Mini
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET ai_settings = jsonb_set(
    jsonb_set(
        ai_settings,
        '{chat_provider}',
        '"proxyapi"'
    ),
    '{chat_model}',
    '"gpt-4o-mini"'
)
WHERE tenant_id = 1;