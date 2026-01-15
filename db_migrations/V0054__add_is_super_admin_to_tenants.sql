-- Добавляем поле is_super_admin для определения суперадмин-тенанта
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.tenants
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- Устанавливаем is_super_admin = true для тенанта с ID = 1
UPDATE t_p56134400_telegram_ai_bot_pdf.tenants
SET is_super_admin = true
WHERE id = 1;

COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenants.is_super_admin IS 'Флаг суперадмина - если true, то это админ-тенант с полными правами';