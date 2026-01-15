-- Add consent settings to tenant_settings
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.tenant_settings 
ADD COLUMN IF NOT EXISTS consent_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS consent_text text DEFAULT 'Я согласен на обработку персональных данных в соответствии с Политикой конфиденциальности';