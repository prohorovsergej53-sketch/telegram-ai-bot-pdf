-- Добавляем колонки для прокси настроек в tenant_settings
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.tenant_settings
ADD COLUMN IF NOT EXISTS use_proxy_openai BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS proxy_openai TEXT,
ADD COLUMN IF NOT EXISTS use_proxy_google BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS proxy_google TEXT,
ADD COLUMN IF NOT EXISTS use_proxy_deepseek BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS proxy_deepseek TEXT,
ADD COLUMN IF NOT EXISTS use_proxy_openrouter BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS proxy_openrouter TEXT,
ADD COLUMN IF NOT EXISTS use_proxy_proxyapi BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS proxy_proxyapi TEXT;

COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.use_proxy_openai IS 'Использовать прокси для OpenAI Whisper';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.proxy_openai IS 'Прокси в формате login:pass@ip:port для OpenAI';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.use_proxy_google IS 'Использовать прокси для Google Speech';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.proxy_google IS 'Прокси в формате login:pass@ip:port для Google';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.use_proxy_deepseek IS 'Использовать прокси для DeepSeek';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.proxy_deepseek IS 'Прокси в формате login:pass@ip:port для DeepSeek';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.use_proxy_openrouter IS 'Использовать прокси для OpenRouter';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.proxy_openrouter IS 'Прокси в формате login:pass@ip:port для OpenRouter';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.use_proxy_proxyapi IS 'Использовать прокси для ProxyAPI';
COMMENT ON COLUMN t_p56134400_telegram_ai_bot_pdf.tenant_settings.proxy_proxyapi IS 'Прокси в формате login:pass@ip:port для ProxyAPI';