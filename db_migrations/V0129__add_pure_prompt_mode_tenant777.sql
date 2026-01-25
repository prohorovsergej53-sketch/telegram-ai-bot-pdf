-- Добавление enable_pure_prompt_mode для тенанта 777 (бот-продажник)
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings 
SET ai_settings = jsonb_set(
  COALESCE(ai_settings, '{}'::jsonb),
  '{enable_pure_prompt_mode}',
  'true'
)
WHERE tenant_id = 777;