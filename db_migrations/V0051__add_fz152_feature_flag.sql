-- Add fz152 feature flag to tenants
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.tenants 
ADD COLUMN IF NOT EXISTS fz152_enabled boolean DEFAULT false;

-- Add privacy policy page content to tenant_settings
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.tenant_settings 
ADD COLUMN IF NOT EXISTS privacy_policy_text text DEFAULT 'Политика обработки персональных данных';

-- Enable fz152 for all existing tenants by default
UPDATE t_p56134400_telegram_ai_bot_pdf.tenants 
SET fz152_enabled = true;