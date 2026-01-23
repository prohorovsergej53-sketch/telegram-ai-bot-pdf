-- Таблица настроек форматирования сообщений для каждого тенанта
CREATE TABLE IF NOT EXISTS t_p56134400_telegram_ai_bot_pdf.messenger_formatting_settings (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES t_p56134400_telegram_ai_bot_pdf.tenants(id),
    messenger VARCHAR(50) NOT NULL, -- telegram, vk, max
    
    -- Основные настройки
    use_emoji BOOLEAN DEFAULT true,
    use_markdown BOOLEAN DEFAULT true,
    use_lists_formatting BOOLEAN DEFAULT true,
    
    -- Эмодзи для ключевых слов (JSON: {"номер": "🏨", "завтрак": "🍳"})
    custom_emoji_map JSONB DEFAULT '{}',
    
    -- Дополнительные настройки форматирования
    list_bullet_char VARCHAR(10) DEFAULT '•',
    numbered_list_char VARCHAR(10) DEFAULT '▫️',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, messenger)
);

-- Индексы для быстрого поиска
CREATE INDEX idx_messenger_formatting_tenant ON t_p56134400_telegram_ai_bot_pdf.messenger_formatting_settings(tenant_id);
CREATE INDEX idx_messenger_formatting_messenger ON t_p56134400_telegram_ai_bot_pdf.messenger_formatting_settings(messenger);

-- Вставляем дефолтные настройки для существующих тенантов
INSERT INTO t_p56134400_telegram_ai_bot_pdf.messenger_formatting_settings 
    (tenant_id, messenger, use_emoji, use_markdown, custom_emoji_map)
SELECT 
    id,
    messenger,
    true,
    CASE WHEN messenger = 'telegram' THEN true ELSE false END,
    CASE 
        WHEN messenger = 'telegram' THEN '{"бассейн": "🏊", "сауна": "🧖", "номер": "🏨", "завтрак": "🍳", "обед": "🍽", "ужин": "🍴", "трансфер": "🚗", "пляж": "🏖", "анимация": "🎭", "стоимость": "💰", "цена": "💰", "время": "🕐", "телефон": "📞", "адрес": "📍"}'::jsonb
        WHEN messenger = 'max' THEN '{"Стандарт": "🏨", "Комфорт": "✨", "Люкс": "👑", "без питания": "🍽", "завтрак": "🍳", "полный пансион": "🍴", "руб": "💰"}'::jsonb
        ELSE '{}'::jsonb
    END
FROM t_p56134400_telegram_ai_bot_pdf.tenants
CROSS JOIN (VALUES ('telegram'), ('vk'), ('max')) AS messengers(messenger)
ON CONFLICT (tenant_id, messenger) DO NOTHING;
