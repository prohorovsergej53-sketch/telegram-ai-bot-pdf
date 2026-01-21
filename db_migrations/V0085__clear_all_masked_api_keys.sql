-- Очистка всех замаскированных API ключей
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_api_keys 
SET key_value = '', is_active = false, updated_at = CURRENT_TIMESTAMP
WHERE key_value LIKE '***%' 
   OR key_value LIKE '••••%'
   OR (key_value = '********' AND provider != 'telegram');