-- Мульти-тенантная архитектура для AI чат-ботов

-- Таблица мастер-шаблона (эталонная версия кода)
CREATE TABLE IF NOT EXISTS t_p56134400_telegram_ai_bot_pdf.master_template (
    id SERIAL PRIMARY KEY,
    version VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    code_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);

-- Таблица тенантов (пары админка+чат)
CREATE TABLE IF NOT EXISTS t_p56134400_telegram_ai_bot_pdf.tenants (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    owner_email VARCHAR(255),
    owner_phone VARCHAR(50),
    template_version VARCHAR(20),
    auto_update BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица настроек тенанта (изолированные данные)
CREATE TABLE IF NOT EXISTS t_p56134400_telegram_ai_bot_pdf.tenant_settings (
    tenant_id INTEGER PRIMARY KEY,
    ai_settings JSONB DEFAULT '{}',
    widget_settings JSONB DEFAULT '{}',
    page_settings JSONB DEFAULT '{}',
    telegram_settings JSONB DEFAULT '{}',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица документов тенанта
CREATE TABLE IF NOT EXISTS t_p56134400_telegram_ai_bot_pdf.tenant_documents (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_key VARCHAR(500) NOT NULL,
    category VARCHAR(100) DEFAULT 'общее',
    pages INTEGER,
    status VARCHAR(50) DEFAULT 'processing',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица чанков документов тенанта
CREATE TABLE IF NOT EXISTS t_p56134400_telegram_ai_bot_pdf.tenant_chunks (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    document_id INTEGER,
    chunk_text TEXT NOT NULL,
    embedding_text TEXT,
    chunk_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица сообщений чата тенанта
CREATE TABLE IF NOT EXISTS t_p56134400_telegram_ai_bot_pdf.tenant_messages (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица логов quality gate для тенанта
CREATE TABLE IF NOT EXISTS t_p56134400_telegram_ai_bot_pdf.tenant_quality_gate_logs (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    user_message TEXT NOT NULL,
    context_ok BOOLEAN NOT NULL,
    gate_reason VARCHAR(100) NOT NULL,
    query_type VARCHAR(50),
    lang VARCHAR(10),
    best_similarity DECIMAL(5,4),
    context_len INTEGER,
    overlap DECIMAL(5,4),
    key_tokens INTEGER,
    top_k_used INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица истории обновлений
CREATE TABLE IF NOT EXISTS t_p56134400_telegram_ai_bot_pdf.update_history (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER,
    from_version VARCHAR(20),
    to_version VARCHAR(20) NOT NULL,
    update_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    updated_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON t_p56134400_telegram_ai_bot_pdf.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON t_p56134400_telegram_ai_bot_pdf.tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenant_documents_tenant_id ON t_p56134400_telegram_ai_bot_pdf.tenant_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_chunks_tenant_id ON t_p56134400_telegram_ai_bot_pdf.tenant_chunks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_chunks_document_id ON t_p56134400_telegram_ai_bot_pdf.tenant_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_tenant_messages_tenant_id ON t_p56134400_telegram_ai_bot_pdf.tenant_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_messages_session_id ON t_p56134400_telegram_ai_bot_pdf.tenant_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_tenant_quality_gate_tenant_id ON t_p56134400_telegram_ai_bot_pdf.tenant_quality_gate_logs(tenant_id);

-- Вставляем мастер-шаблон (версия 1.0.0 - текущий код)
INSERT INTO t_p56134400_telegram_ai_bot_pdf.master_template (version, description, code_hash, created_by)
VALUES ('1.0.0', 'Initial master template with RAG debug mode', 'initial', 'system')
ON CONFLICT (version) DO NOTHING;

-- Создаём дефолтный тенант из существующих данных
INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenants (slug, name, description, template_version, status)
VALUES ('default', 'Default Tenant', 'Мигрированный из существующей системы', '1.0.0', 'active')
ON CONFLICT (slug) DO NOTHING;