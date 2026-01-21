UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_api_keys 
SET is_active = true, updated_at = CURRENT_TIMESTAMP
WHERE tenant_id = 2 
  AND provider = 'proxyapi' 
  AND key_name = 'api_key'
  AND LENGTH(key_value) > 10;