-- Добавить поле show_bot_promo со значением по умолчанию true для всех тенантов
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET page_settings = jsonb_set(
  COALESCE(page_settings, '{}'::jsonb),
  '{show_bot_promo}',
  'true'::jsonb
)
WHERE page_settings IS NULL 
   OR NOT page_settings ? 'show_bot_promo';
