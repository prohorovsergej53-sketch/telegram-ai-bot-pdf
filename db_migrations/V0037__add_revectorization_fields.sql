-- Добавление полей для отслеживания статуса ревекторизации документов
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.tenant_settings
ADD COLUMN IF NOT EXISTS revectorization_status VARCHAR(20) DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS revectorization_progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS revectorization_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS revectorization_model VARCHAR(50),
ADD COLUMN IF NOT EXISTS revectorization_error TEXT;

COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.revectorization_status IS 'Статус ревекторизации: idle, processing, completed, error';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.revectorization_progress IS 'Количество обработанных документов';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.revectorization_total IS 'Общее количество документов для обработки';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.revectorization_model IS 'Модель для которой идёт ревекторизация';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.revectorization_error IS 'Текст ошибки при ревекторизации';
