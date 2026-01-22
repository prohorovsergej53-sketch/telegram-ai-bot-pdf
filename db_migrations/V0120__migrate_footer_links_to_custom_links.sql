-- Миграция старого footer_link в новый формат с 3 пользовательскими ссылками
-- Если был footer_link, переносим его в footer_link_1

UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET page_settings = jsonb_set(
  jsonb_set(
    page_settings - 'footer_link' - 'footer_text',
    '{footer_link_1_text}',
    COALESCE(page_settings->'footer_text', '"Забронировать номер"'::jsonb)
  ),
  '{footer_link_1_url}',
  page_settings->'footer_link'
)
WHERE page_settings ? 'footer_link' 
  AND page_settings->>'footer_link' IS NOT NULL 
  AND page_settings->>'footer_link' != '';
