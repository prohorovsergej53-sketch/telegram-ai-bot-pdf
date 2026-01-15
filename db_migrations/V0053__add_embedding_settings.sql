-- Добавляем поля для настроек эмбеддингов
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.tenant_settings
ADD COLUMN IF NOT EXISTS embedding_provider VARCHAR(50) DEFAULT 'yandex',
ADD COLUMN IF NOT EXISTS embedding_doc_model VARCHAR(100) DEFAULT 'text-search-doc',
ADD COLUMN IF NOT EXISTS embedding_query_model VARCHAR(100) DEFAULT 'text-search-query';

COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.embedding_provider IS 'Провайдер эмбеддингов: yandex, openai';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.embedding_doc_model IS 'Модель эмбеддингов для документов (256 или 1536 размерность)';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.embedding_query_model IS 'Модель эмбеддингов для поисковых запросов';