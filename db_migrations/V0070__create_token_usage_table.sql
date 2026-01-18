-- Таблица для учета использования токенов
CREATE TABLE IF NOT EXISTS token_usage (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    operation_type VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    tokens_used INTEGER NOT NULL,
    cost_rubles NUMERIC(10, 4) NOT NULL,
    request_id VARCHAR(255) NULL,
    metadata JSONB NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_token_usage_tenant_id ON token_usage(tenant_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_created_at ON token_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_token_usage_operation_type ON token_usage(operation_type);

-- Комментарии для понимания структуры
COMMENT ON TABLE token_usage IS 'Статистика использования токенов и расходов по тенантам';
COMMENT ON COLUMN token_usage.operation_type IS 'Тип операции: embedding_create (создание базы), embedding_query (запрос пользователя), gpt_response (генерация ответа)';
COMMENT ON COLUMN token_usage.cost_rubles IS 'Стоимость операции в рублях (рассчитывается по тарифам Yandex Cloud)';