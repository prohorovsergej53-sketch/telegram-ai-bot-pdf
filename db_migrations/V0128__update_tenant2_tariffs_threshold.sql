-- Обновление порога min_sim для tariffs у тенанта ID2
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings 
SET quality_gate_settings = jsonb_set(quality_gate_settings, '{tariffs,min_sim}', '0.22')
WHERE tenant_id = 2;