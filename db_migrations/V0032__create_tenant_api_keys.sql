-- Таблица для хранения API ключей каждого клиента
CREATE TABLE IF NOT EXISTS t_p56134400_telegram_ai_bot_pdf.tenant_api_keys (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    provider VARCHAR(50) NOT NULL,
    key_name VARCHAR(100) NOT NULL,
    key_value TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, provider, key_name)
);

CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_tenant ON t_p56134400_telegram_ai_bot_pdf.tenant_api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_provider ON t_p56134400_telegram_ai_bot_pdf.tenant_api_keys(tenant_id, provider);

COMMENT ON TABLE t_p56134400_telegram_ai_bot_pdf.tenant_api_keys IS 'API ключи для каждого клиента индивидуально';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_api_keys.key_value IS 'Зашифрованное значение ключа (можно добавить шифрование позже)';