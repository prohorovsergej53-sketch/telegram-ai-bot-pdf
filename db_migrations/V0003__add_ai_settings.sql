-- Таблица для хранения настроек AI провайдеров
CREATE TABLE IF NOT EXISTS t_p56134400_telegram_ai_bot_pdf.ai_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставляем настройки по умолчанию
INSERT INTO t_p56134400_telegram_ai_bot_pdf.ai_settings (setting_key, setting_value) 
VALUES 
    ('chat_provider', 'deepseek'),
    ('chat_model', 'deepseek-chat'),
    ('embedding_provider', 'openai'),
    ('embedding_model', 'text-embedding-3-small')
ON CONFLICT (setting_key) DO NOTHING;
