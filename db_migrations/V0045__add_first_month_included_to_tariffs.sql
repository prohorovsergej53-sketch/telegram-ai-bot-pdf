-- Добавить флаг "первый месяц включен в setup_fee"
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.tariff_plans 
ADD COLUMN first_month_included BOOLEAN DEFAULT false;

COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tariff_plans.first_month_included IS 'Если true, то первый месяц включен в setup_fee и первый платеж = setup_fee. Если false, то первый платеж = setup_fee + renewal_price';

-- Обновить текущие тарифы: у всех первый месяц включен в setup_fee
UPDATE t_p56134400_telegram_ai_bot_pdf.tariff_plans 
SET first_month_included = true
WHERE id IN ('basic', 'professional', 'enterprise');