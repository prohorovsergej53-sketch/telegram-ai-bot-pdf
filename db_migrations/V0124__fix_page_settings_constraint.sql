-- Удаляем constraint уникальности на setting_key
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.page_settings DROP CONSTRAINT IF EXISTS page_settings_setting_key_key;

-- Создаём правильный уникальный индекс на (tenant_id, setting_key)
CREATE UNIQUE INDEX IF NOT EXISTS page_settings_tenant_key_unique ON t_p56134400_telegram_ai_bot_pdf.page_settings(tenant_id, setting_key);

-- Копируем page_settings для всех тенантов
INSERT INTO t_p56134400_telegram_ai_bot_pdf.page_settings (tenant_id, setting_key, setting_value)
SELECT t.id, ps.setting_key, ps.setting_value
FROM t_p56134400_telegram_ai_bot_pdf.tenants t,
     t_p56134400_telegram_ai_bot_pdf.page_settings ps
WHERE t.id <> 1 AND ps.tenant_id = 1;