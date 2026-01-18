-- Копируем рабочие Yandex ключи из шаблона (tenant_id=1) в tenant_id=2
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_api_keys
SET key_value = (
  SELECT key_value 
  FROM t_p56134400_telegram_ai_bot_pdf.tenant_api_keys 
  WHERE tenant_id = 1 AND provider = 'yandex' AND key_name = 'api_key'
)
WHERE tenant_id = 2 AND provider = 'yandex' AND key_name = 'api_key';

UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_api_keys
SET key_value = (
  SELECT key_value 
  FROM t_p56134400_telegram_ai_bot_pdf.tenant_api_keys 
  WHERE tenant_id = 1 AND provider = 'yandex' AND key_name = 'folder_id'
)
WHERE tenant_id = 2 AND provider = 'yandex' AND key_name = 'folder_id';
