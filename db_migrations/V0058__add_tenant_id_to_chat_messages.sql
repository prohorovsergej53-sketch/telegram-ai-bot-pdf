-- Добавляем колонку tenant_id в таблицу chat_messages
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.chat_messages 
ADD COLUMN IF NOT EXISTS tenant_id INTEGER;

-- Создаём индекс для быстрой фильтрации по tenant_id
CREATE INDEX IF NOT EXISTS idx_chat_messages_tenant_id 
ON t_p56134400_telegram_ai_bot_pdf.chat_messages(tenant_id);

-- Создаём составной индекс для оптимизации запросов статистики
CREATE INDEX IF NOT EXISTS idx_chat_messages_tenant_role_created 
ON t_p56134400_telegram_ai_bot_pdf.chat_messages(tenant_id, role, created_at DESC);

-- Комментарий к колонке
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.chat_messages.tenant_id 
IS 'ID клиента (тенанта) для изоляции данных';