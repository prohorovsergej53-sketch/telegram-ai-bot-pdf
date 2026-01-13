-- Создание бота-продажника (tenant_id = 0) для лендинга
INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenants 
(id, slug, name, description, owner_email, owner_phone, template_version, auto_update, status, is_public, subscription_status, tariff_id)
VALUES 
(0, 'sales', 'Бот-продажник', 'Демонстрационный бот для лендинга', 'admin@ai-ru.ru', '', '1.0.0', false, 'active', true, 'active', 'enterprise')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_public = EXCLUDED.is_public;

-- Обновление sequence для корректной генерации ID
SELECT setval('t_p56134400_telegram_ai_bot_pdf.tenants_id_seq', (SELECT MAX(id) FROM t_p56134400_telegram_ai_bot_pdf.tenants) + 1);

-- Создание записи настроек для бота-продажника
INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenant_settings (tenant_id)
VALUES (0)
ON CONFLICT (tenant_id) DO NOTHING;

-- Переименование tenant_id = 1 в шаблон
UPDATE t_p56134400_telegram_ai_bot_pdf.tenants
SET 
  slug = 'template',
  name = 'Шаблон для новых ботов',
  description = 'Настройки по умолчанию для новых клиентов'
WHERE id = 1;

-- Убедиться что у template есть настройки
INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenant_settings (tenant_id)
VALUES (1)
ON CONFLICT (tenant_id) DO NOTHING;

-- Добавление комментариев для ясности
COMMENT ON TABLE t_p56134400_telegram_ai_bot_pdf.tenants IS 'tenant_id=0 - бот-продажник на лендинге, tenant_id=1 - шаблон для новых ботов';
