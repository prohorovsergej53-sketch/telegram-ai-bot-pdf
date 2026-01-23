-- Добавляем tenant_id в widget_settings
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.widget_settings ADD COLUMN IF NOT EXISTS tenant_id INTEGER;

-- Устанавливаем tenant_id=1 для существующей записи
UPDATE t_p56134400_telegram_ai_bot_pdf.widget_settings SET tenant_id = 1 WHERE tenant_id IS NULL;

-- Копируем настройки для остальных тенантов
INSERT INTO t_p56134400_telegram_ai_bot_pdf.widget_settings 
    (tenant_id, button_color, button_color_end, button_size, button_position, window_width, window_height, 
     header_title, header_color, header_color_end, border_radius, show_branding, custom_css, chat_url, button_icon)
SELECT t.id, ws.button_color, ws.button_color_end, ws.button_size, ws.button_position, ws.window_width, 
       ws.window_height, ws.header_title, ws.header_color, ws.header_color_end, ws.border_radius, 
       ws.show_branding, ws.custom_css, ws.chat_url, ws.button_icon
FROM t_p56134400_telegram_ai_bot_pdf.tenants t,
     t_p56134400_telegram_ai_bot_pdf.widget_settings ws
WHERE t.id <> 1 AND ws.tenant_id = 1;

-- Делаем tenant_id обязательным и уникальным
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.widget_settings ALTER COLUMN tenant_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS widget_settings_tenant_unique ON t_p56134400_telegram_ai_bot_pdf.widget_settings(tenant_id);