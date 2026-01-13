-- Добавляем настройки автосообщений в таблицу tenant_settings
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.tenant_settings 
ADD COLUMN IF NOT EXISTS auto_message_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS auto_message_delay_seconds INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS auto_message_text TEXT DEFAULT 'Могу помочь с выбором? 😊',
ADD COLUMN IF NOT EXISTS auto_message_repeat BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS auto_message_repeat_delay_seconds INTEGER DEFAULT 60;

COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.auto_message_enabled IS 'Включены ли автосообщения при бездействии';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.auto_message_delay_seconds IS 'Задержка первого автосообщения (секунды)';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.auto_message_text IS 'Текст автосообщения';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.auto_message_repeat IS 'Повторять ли автосообщения после первого';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.auto_message_repeat_delay_seconds IS 'Задержка повторных автосообщений (секунды)';