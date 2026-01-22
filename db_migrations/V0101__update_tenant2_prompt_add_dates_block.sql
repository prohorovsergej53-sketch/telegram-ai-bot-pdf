-- Обновляем промпт для tenant_id=2, добавляя критичный блок про работу с датами
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET ai_settings = jsonb_set(
  ai_settings,
  '{system_prompt}',
  (SELECT to_jsonb(setting_value) 
   FROM t_p56134400_telegram_ai_bot_pdf.default_settings 
   WHERE setting_key = 'default_system_prompt')
)
WHERE tenant_id = 2;