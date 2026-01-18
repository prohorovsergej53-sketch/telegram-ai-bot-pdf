-- Копируем рабочие Yandex ключи из tenant_id=777 на все остальные тенанты
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_api_keys
SET key_value = (
  SELECT key_value 
  FROM t_p56134400_telegram_ai_bot_pdf.tenant_api_keys 
  WHERE tenant_id = 777 AND provider = 'yandex' AND key_name = 'api_key'
)
WHERE provider = 'yandex' AND key_name = 'api_key' AND tenant_id != 777;

UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_api_keys
SET key_value = (
  SELECT key_value 
  FROM t_p56134400_telegram_ai_bot_pdf.tenant_api_keys 
  WHERE tenant_id = 777 AND provider = 'yandex' AND key_name = 'folder_id'
)
WHERE provider = 'yandex' AND key_name = 'folder_id' AND tenant_id != 777;
