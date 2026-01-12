-- Создаем запись для tenant_id=1 если её нет
INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenant_settings (tenant_id)
VALUES (1)
ON CONFLICT (tenant_id) DO NOTHING;

-- Мигрируем page_settings в JSONB
WITH page_data AS (
    SELECT jsonb_object_agg(setting_key, setting_value) as settings
    FROM t_p56134400_telegram_ai_bot_pdf.page_settings
)
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET page_settings = page_data.settings,
    updated_at = CURRENT_TIMESTAMP
FROM page_data
WHERE tenant_id = 1;

-- Мигрируем widget_settings в JSONB
WITH widget_data AS (
    SELECT jsonb_build_object(
        'button_color', button_color,
        'button_color_end', button_color_end,
        'button_size', button_size,
        'button_position', button_position,
        'window_width', window_width,
        'window_height', window_height,
        'header_title', header_title,
        'header_color', header_color,
        'header_color_end', header_color_end,
        'border_radius', border_radius,
        'show_branding', show_branding,
        'custom_css', custom_css,
        'chat_url', chat_url,
        'button_icon', button_icon
    ) as settings
    FROM t_p56134400_telegram_ai_bot_pdf.widget_settings
    WHERE id = 1
)
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET widget_settings = widget_data.settings,
    updated_at = CURRENT_TIMESTAMP
FROM widget_data
WHERE tenant_id = 1;

-- Мигрируем ai_settings и ai_model_settings в JSONB
WITH ai_data AS (
    SELECT jsonb_object_agg(setting_key, setting_value) as general_settings
    FROM t_p56134400_telegram_ai_bot_pdf.ai_settings
),
model_data AS (
    SELECT jsonb_build_object(
        'model', model,
        'temperature', temperature::text,
        'top_p', top_p::text,
        'frequency_penalty', frequency_penalty::text,
        'presence_penalty', presence_penalty::text,
        'max_tokens', max_tokens,
        'system_priority', system_priority,
        'creative_mode', creative_mode
    ) as model_settings
    FROM t_p56134400_telegram_ai_bot_pdf.ai_model_settings
    ORDER BY id DESC
    LIMIT 1
)
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET ai_settings = COALESCE(ai_data.general_settings, '{}'::jsonb) || COALESCE(model_data.model_settings, '{}'::jsonb),
    updated_at = CURRENT_TIMESTAMP
FROM ai_data, model_data
WHERE tenant_id = 1;