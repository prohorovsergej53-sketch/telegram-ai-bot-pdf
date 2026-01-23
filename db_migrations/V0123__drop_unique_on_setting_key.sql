-- Удаляем constraint уникальности на setting_key
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.ai_settings DROP CONSTRAINT IF EXISTS ai_settings_setting_key_key;