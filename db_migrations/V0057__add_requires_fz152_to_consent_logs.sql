-- Добавляем поле requires_fz152 в таблицу sales_consent_logs
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.sales_consent_logs
ADD COLUMN IF NOT EXISTS requires_fz152 boolean DEFAULT false;