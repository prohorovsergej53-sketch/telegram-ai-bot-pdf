-- Добавляем статусы активности для пользователей
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.admin_users
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS tariff_id VARCHAR(50);

-- Добавляем статус публичной видимости для тенантов
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.tenants
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS tariff_id VARCHAR(50);

-- Создаем таблицу для управления тарифами
CREATE TABLE IF NOT EXISTS t_p56134400_telegram_ai_bot_pdf.tariff_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    period VARCHAR(50) DEFAULT 'month',
    features JSONB,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставляем дефолтные тарифы
INSERT INTO t_p56134400_telegram_ai_bot_pdf.tariff_plans (id, name, price, period, features, is_popular, is_active, sort_order)
VALUES 
('basic', 'Базовый', 2990.00, 'месяц', '["AI-консьерж в Telegram", "До 1000 сообщений в месяц", "Загрузка до 10 документов", "Базовая аналитика", "Email поддержка"]'::jsonb, false, true, 1),
('professional', 'Профессиональный', 5990.00, 'месяц', '["AI-консьерж в Telegram, WhatsApp, VK", "До 5000 сообщений в месяц", "Безлимитная загрузка документов", "Расширенная аналитика", "Настройка промптов и моделей", "Приоритетная поддержка"]'::jsonb, true, true, 2),
('enterprise', 'Корпоративный', 14990.00, 'месяц', '["Все возможности Professional", "Безлимитные сообщения", "Несколько ботов (до 5)", "Кастомизация интерфейса", "Интеграция с CRM", "Персональный менеджер", "SLA 99.9%"]'::jsonb, false, true, 3)
ON CONFLICT (id) DO NOTHING;

-- Добавляем секреты ЮKassa в default_settings
INSERT INTO t_p56134400_telegram_ai_bot_pdf.default_settings (setting_key, setting_value, description)
VALUES 
('yookassa_shop_id', '', 'ID магазина ЮKassa для приема платежей'),
('yookassa_secret_key', '', 'Секретный ключ ЮKassa API')
ON CONFLICT (setting_key) DO NOTHING;

-- Создаем таблицу для истории платежей
CREATE TABLE IF NOT EXISTS t_p56134400_telegram_ai_bot_pdf.subscription_payments (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES t_p56134400_telegram_ai_bot_pdf.tenants(id),
    payment_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10, 2),
    status VARCHAR(50),
    tariff_id VARCHAR(50),
    payment_type VARCHAR(50) DEFAULT 'initial',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.admin_users.subscription_status IS 'Статус подписки: active, expired, cancelled';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenants.is_public IS 'Публичная видимость тенанта (доступен ли гостям)';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.subscription_payments.payment_type IS 'Тип платежа: initial, renewal';
