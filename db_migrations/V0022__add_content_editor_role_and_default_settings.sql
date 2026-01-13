-- Добавляем новую роль content_editor для пользователей
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.admin_users 
  DROP CONSTRAINT IF EXISTS admin_users_role_check;

ALTER TABLE t_p56134400_telegram_ai_bot_pdf.admin_users 
  ADD CONSTRAINT admin_users_role_check 
  CHECK (role IN ('super_admin', 'tenant_admin', 'content_editor'));

-- Создаем таблицу для хранения дефолтных настроек (промпт, шаблоны писем)
CREATE TABLE IF NOT EXISTS t_p56134400_telegram_ai_bot_pdf.default_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Вставляем дефолтный промпт
INSERT INTO t_p56134400_telegram_ai_bot_pdf.default_settings (setting_key, setting_value, description)
VALUES 
  ('default_system_prompt', 'Ты — дружелюбный AI-консьерж отеля «Династия» в Telegram...', 'Дефолтный системный промпт для новых тенантов'),
  ('email_template_welcome', 'Здравствуйте!\n\nДобро пожаловать в систему управления AI-ботом для вашего бизнеса.\n\nВаши данные для входа:\nЛогин: {username}\nПароль: {password}\nСсылка для входа: {login_url}\n\nВы можете редактировать:\n- Публичную информацию на странице\n- Часто задаваемые вопросы\n- Тексты приветствий\n\nС уважением,\nКоманда поддержки', 'Шаблон письма для нового пользователя')
ON CONFLICT (setting_key) DO NOTHING;

-- Добавляем поле description в tenant_settings для публичной страницы
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.tenant_settings 
  ADD COLUMN IF NOT EXISTS public_description TEXT DEFAULT '';

COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.public_description 
  IS 'Публичное описание для страницы тенанта (редактируется content_editor)';