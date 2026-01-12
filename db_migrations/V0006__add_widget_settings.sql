-- Создаем таблицу настроек виджета
CREATE TABLE IF NOT EXISTS t_p56134400_telegram_ai_bot_pdf.widget_settings (
    id SERIAL PRIMARY KEY,
    button_color VARCHAR(50) DEFAULT '#667eea',
    button_color_end VARCHAR(50) DEFAULT '#764ba2',
    button_size INTEGER DEFAULT 60,
    button_position VARCHAR(20) DEFAULT 'bottom-right',
    window_width INTEGER DEFAULT 380,
    window_height INTEGER DEFAULT 600,
    header_title VARCHAR(255) DEFAULT 'AI Ассистент',
    header_color VARCHAR(50) DEFAULT '#667eea',
    header_color_end VARCHAR(50) DEFAULT '#764ba2',
    border_radius INTEGER DEFAULT 16,
    show_branding BOOLEAN DEFAULT true,
    custom_css TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Вставляем дефолтные настройки
INSERT INTO t_p56134400_telegram_ai_bot_pdf.widget_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;