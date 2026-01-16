-- Таблица для хранения сообщений чата поддержки
CREATE TABLE IF NOT EXISTS t_p56134400_telegram_ai_bot_pdf.support_messages (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    user_phone VARCHAR(255),
    message_text TEXT NOT NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'admin')),
    telegram_message_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

-- Индексы для быстрого поиска
CREATE INDEX idx_support_messages_session_id ON t_p56134400_telegram_ai_bot_pdf.support_messages(session_id);
CREATE INDEX idx_support_messages_created_at ON t_p56134400_telegram_ai_bot_pdf.support_messages(created_at DESC);
CREATE INDEX idx_support_messages_is_read ON t_p56134400_telegram_ai_bot_pdf.support_messages(is_read) WHERE is_read = FALSE;

-- Комментарии
COMMENT ON TABLE t_p56134400_telegram_ai_bot_pdf.support_messages IS 'Сообщения чата поддержки с интеграцией Telegram';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.support_messages.session_id IS 'Уникальный ID сессии чата (генерируется на клиенте)';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.support_messages.sender_type IS 'Тип отправителя: user (клиент) или admin (суперадмин)';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.support_messages.telegram_message_id IS 'ID сообщения в Telegram для связи ответов';