-- Копирование API-ключей из шаблона (tenant_id=1) всем существующим тенантам без ключей
INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenant_api_keys 
(tenant_id, provider, key_name, key_value, is_active)
SELECT 
    t.id,
    tk.provider,
    tk.key_name,
    tk.key_value,
    tk.is_active
FROM t_p56134400_telegram_ai_bot_pdf.tenants t
CROSS JOIN t_p56134400_telegram_ai_bot_pdf.tenant_api_keys tk
WHERE tk.tenant_id = 1 
  AND tk.is_active = true
  AND t.id != 1
  AND NOT EXISTS (
    SELECT 1 
    FROM t_p56134400_telegram_ai_bot_pdf.tenant_api_keys existing
    WHERE existing.tenant_id = t.id
      AND existing.provider = tk.provider
      AND existing.key_name = tk.key_name
  );