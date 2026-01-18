-- Исправляем шаблон (tenant_id=1) для корректного копирования
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET 
  ai_settings = jsonb_set(
    jsonb_set(
      ai_settings,
      '{embedding_provider}', '"yandex"'::jsonb
    ),
    '{embedding_model}', '"text-search-query"'::jsonb
  ),
  embedding_provider = 'yandex',
  embedding_query_model = 'text-search-query'
WHERE tenant_id = 1;

-- Исправляем тенанты 10, 11, 777 (там deepseek/openai)
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET 
  ai_settings = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          COALESCE(ai_settings, '{}'::jsonb),
          '{chat_provider}', '"yandex"'::jsonb
        ),
        '{chat_model}', '"yandexgpt"'::jsonb
      ),
      '{embedding_provider}', '"yandex"'::jsonb
    ),
    '{embedding_model}', '"text-search-query"'::jsonb
  ),
  embedding_provider = 'yandex',
  embedding_query_model = 'text-search-query'
WHERE tenant_id IN (10, 11, 777);

-- Создаем настройки для тенантов без них (6, 7, 8, 9)
INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenant_settings (tenant_id, ai_settings, embedding_provider, embedding_query_model)
SELECT 
  t.id,
  '{"chat_provider": "yandex", "chat_model": "yandexgpt", "embedding_provider": "yandex", "embedding_model": "text-search-query"}'::jsonb,
  'yandex',
  'text-search-query'
FROM t_p56134400_telegram_ai_bot_pdf.tenants t
WHERE t.id IN (6, 7, 8, 9)
  AND NOT EXISTS (
    SELECT 1 FROM t_p56134400_telegram_ai_bot_pdf.tenant_settings ts 
    WHERE ts.tenant_id = t.id
  );

-- Исправляем пустые ai_settings (tenant 3, 4)
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET 
  ai_settings = '{"chat_provider": "yandex", "chat_model": "yandexgpt", "embedding_provider": "yandex", "embedding_model": "text-search-query"}'::jsonb
WHERE tenant_id IN (3, 4) AND (ai_settings IS NULL OR ai_settings = '{}'::jsonb);
