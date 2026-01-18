-- Обновляем AI настройки для demo-hotel-aurora на Яндекс (152-ФЗ)
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET 
  ai_settings = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          ai_settings,
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
WHERE tenant_id = 2;
