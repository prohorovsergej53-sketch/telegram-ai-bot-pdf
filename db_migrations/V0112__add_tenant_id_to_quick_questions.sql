-- Добавляем поле tenant_id к quick_questions
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.quick_questions
ADD COLUMN tenant_id INTEGER;

-- Создаем внешний ключ с NO ACTION вместо CASCADE
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.quick_questions
ADD CONSTRAINT fk_quick_questions_tenant 
FOREIGN KEY (tenant_id) REFERENCES t_p56134400_telegram_ai_bot_pdf.tenants(id);

-- Создаем индекс для быстрого поиска по tenant_id
CREATE INDEX idx_quick_questions_tenant_id ON t_p56134400_telegram_ai_bot_pdf.quick_questions(tenant_id);

-- Обновляем существующие записи для tenant_id=2
UPDATE t_p56134400_telegram_ai_bot_pdf.quick_questions
SET tenant_id = 2
WHERE id IN (11, 12, 13, 14);