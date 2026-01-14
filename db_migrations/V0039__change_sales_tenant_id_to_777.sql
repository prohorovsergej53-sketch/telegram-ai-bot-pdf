-- Изменить ID тенанта sales с 0 на 777
UPDATE t_p56134400_telegram_ai_bot_pdf.tenants 
SET id = 777 
WHERE slug = 'sales' AND id = 0;
