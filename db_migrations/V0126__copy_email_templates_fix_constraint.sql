-- Удаляем старый constraint на template_key
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.email_templates DROP CONSTRAINT IF EXISTS email_templates_template_key_key;

-- Копируем шаблоны для остальных тенантов
INSERT INTO t_p56134400_telegram_ai_bot_pdf.email_templates (tenant_id, template_key, subject, body, description)
SELECT t.id, et.template_key, et.subject, et.body, et.description
FROM t_p56134400_telegram_ai_bot_pdf.tenants t,
     t_p56134400_telegram_ai_bot_pdf.email_templates et
WHERE t.id <> 1 AND et.tenant_id = 1;

-- Делаем tenant_id обязательным
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.email_templates ALTER COLUMN tenant_id SET NOT NULL;

-- Создаём правильный уникальный индекс
CREATE UNIQUE INDEX IF NOT EXISTS email_templates_tenant_key_unique ON t_p56134400_telegram_ai_bot_pdf.email_templates(tenant_id, template_key);