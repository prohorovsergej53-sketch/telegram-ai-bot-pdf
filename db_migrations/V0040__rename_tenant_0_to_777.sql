-- Перенос настроек с tenant_id=0 на tenant_id=777 (sales)
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings 
SET tenant_id = 777 
WHERE tenant_id = 0;