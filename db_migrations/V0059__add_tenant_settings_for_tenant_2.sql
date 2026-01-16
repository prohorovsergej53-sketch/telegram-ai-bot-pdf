-- Добавление настроек для tenant_id=2 (Отель Аврора)
INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenant_settings (
    tenant_id, 
    embedding_provider, 
    embedding_doc_model, 
    embedding_query_model,
    updated_at
) 
VALUES (
    2, 
    'yandex', 
    'text-search-doc', 
    'text-search-query',
    CURRENT_TIMESTAMP
)
ON CONFLICT (tenant_id) DO NOTHING;