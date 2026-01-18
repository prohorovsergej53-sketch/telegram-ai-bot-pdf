-- Восстанавливаем шаблон (tenant_id=1): ProxyAPI для чата, Yandex для эмбеддингов
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET 
  ai_settings = jsonb_set(
    jsonb_set(
      COALESCE(ai_settings, '{}'::jsonb),
      '{chat_provider}', '"proxyapi"'::jsonb
    ),
    '{chat_model}', '"gpt-4o-mini"'::jsonb
  )
WHERE tenant_id = 1;

-- Восстанавливаем тенанты БЕЗ ФЗ-152 на ProxyAPI для чата
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings ts
SET 
  ai_settings = jsonb_set(
    jsonb_set(
      COALESCE(ts.ai_settings, '{}'::jsonb),
      '{chat_provider}', '"proxyapi"'::jsonb
    ),
    '{chat_model}', '"gpt-4o-mini"'::jsonb
  )
WHERE ts.tenant_id IN (
  SELECT t.id FROM t_p56134400_telegram_ai_bot_pdf.tenants t
  WHERE (t.fz152_enabled = false OR t.fz152_enabled IS NULL)
  AND t.id != 1
);
