-- Обновление настроек страницы для тенанта 2 (Отель Династия)
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET page_settings = jsonb_set(
    jsonb_set(
        jsonb_set(
            COALESCE(page_settings, '{}'::jsonb),
            '{page_title}', 
            '"AI-консьерж"'::jsonb
        ),
        '{page_subtitle}',
        '"Виртуальный помощник гостей"'::jsonb
    ),
    '{footer_link}',
    '"https://max.ru/u/f9LHodD0cOIrknUlAYx1LxuVyfuHRhIq-OHhkpPMbwJ_WcjW4dhTFpEEez0"'::jsonb
)
WHERE tenant_id = 2;