-- Добавление настроек распознавания голосовых сообщений для tenant_settings
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.tenant_settings
ADD COLUMN IF NOT EXISTS speech_recognition_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS speech_recognition_provider VARCHAR(50) DEFAULT 'yandex',
ADD COLUMN IF NOT EXISTS speech_recognition_auto_yandex_on_fz152 BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.speech_recognition_enabled IS 'Включено ли распознавание голосовых сообщений';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.speech_recognition_provider IS 'Провайдер распознавания: yandex, openai_whisper, google';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.speech_recognition_auto_yandex_on_fz152 IS 'Автоматически переключать на Яндекс при включении ФЗ-152';