-- Установить правильные значения setup_fee для текущих тарифов
-- Старт: setup_fee = 9975 (первый месяц включен)
-- Бизнес: setup_fee = 19975 (первый месяц включен)  
-- Премиум: setup_fee = 49975 (первый месяц включен)

UPDATE t_p56134400_telegram_ai_bot_pdf.tariff_plans 
SET 
    setup_fee = 9975.00,
    price = 9975.00
WHERE id = 'basic';

UPDATE t_p56134400_telegram_ai_bot_pdf.tariff_plans 
SET 
    setup_fee = 19975.00,
    price = 19975.00
WHERE id = 'professional';

UPDATE t_p56134400_telegram_ai_bot_pdf.tariff_plans 
SET 
    setup_fee = 49975.00,
    price = 49975.00
WHERE id = 'enterprise';