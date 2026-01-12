CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    file_key VARCHAR(500) NOT NULL,
    size_bytes BIGINT NOT NULL,
    pages INTEGER,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'processing',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_document_chunks_doc_id ON document_chunks(document_id);

CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, created_at);