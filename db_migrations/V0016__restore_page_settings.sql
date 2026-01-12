-- Восстанавливаем page_settings из старой таблицы
WITH page_data AS (
    SELECT jsonb_object_agg(setting_key, setting_value) as settings
    FROM t_p56134400_telegram_ai_bot_pdf.page_settings
)
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET page_settings = page_data.settings,
    updated_at = CURRENT_TIMESTAMP
FROM page_data
WHERE tenant_id = 1;