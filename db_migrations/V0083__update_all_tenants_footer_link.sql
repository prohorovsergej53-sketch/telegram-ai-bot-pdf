-- Обновление footer_link для всех тенантов на правильную ссылку
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET page_settings = jsonb_set(
    COALESCE(page_settings, '{}'::jsonb),
    '{footer_link}',
    '"https://max.ru/u/f9LHodD0cOIrknUlAYx1LxuVyfuHRhIq-OHhkpPMbwJ_WcjW4dhTFpEEez0"'::jsonb
)
WHERE page_settings->>'footer_link' = 'https://max.im/+79787236035' 
   OR page_settings->>'footer_link' IS NULL;