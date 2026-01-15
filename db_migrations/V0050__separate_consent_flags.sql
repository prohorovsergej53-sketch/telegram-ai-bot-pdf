-- Separate consent flags for web-chat and messengers
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.tenant_settings 
ADD COLUMN IF NOT EXISTS consent_webchat_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS consent_messenger_enabled boolean DEFAULT true;

-- Copy existing consent_enabled to both new fields
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings 
SET 
  consent_webchat_enabled = consent_enabled,
  consent_messenger_enabled = consent_enabled;