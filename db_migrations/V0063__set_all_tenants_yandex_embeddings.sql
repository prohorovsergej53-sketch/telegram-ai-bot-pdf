-- Обновляем существующие записи на Яндекс эмбеддинги
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET 
  embedding_provider = 'yandex',
  embedding_doc_model = 'text-search-doc',
  embedding_query_model = 'text-search-query',
  updated_at = CURRENT_TIMESTAMP
WHERE embedding_provider != 'yandex' 
   OR embedding_doc_model != 'text-search-doc' 
   OR embedding_query_model != 'text-search-query';

-- Создаем записи для тенантов без настроек
INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenant_settings (tenant_id, embedding_provider, embedding_doc_model, embedding_query_model)
SELECT t.id, 'yandex', 'text-search-doc', 'text-search-query'
FROM t_p56134400_telegram_ai_bot_pdf.tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM t_p56134400_telegram_ai_bot_pdf.tenant_settings ts 
  WHERE ts.tenant_id = t.id
);