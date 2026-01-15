-- Add messenger consent text to tenant_settings
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.tenant_settings 
ADD COLUMN IF NOT EXISTS consent_messenger_text text DEFAULT 'Продолжая диалог, вы соглашаетесь на обработку персональных данных согласно нашей Политике конфиденциальности.';