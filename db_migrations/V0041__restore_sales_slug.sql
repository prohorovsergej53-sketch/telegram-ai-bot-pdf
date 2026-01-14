-- Возвращаем slug обратно на sales
UPDATE t_p56134400_telegram_ai_bot_pdf.tenants 
SET slug = 'sales', updated_at = CURRENT_TIMESTAMP
WHERE id = 777;