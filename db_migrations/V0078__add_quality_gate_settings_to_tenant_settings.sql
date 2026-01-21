-- Добавляем возможность настройки Quality Gate параметров для каждого тенанта
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.tenant_settings
ADD COLUMN IF NOT EXISTS quality_gate_settings JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.quality_gate_settings IS 'Настройки Quality Gate для RAG: thresholds для tariffs/rules/services/default';
