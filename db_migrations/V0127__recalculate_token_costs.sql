-- Пересчёт стоимости токенов для DeepSeek и других моделей, где cost_rubles = 0

-- DeepSeek Chat: $0.14 per 1M tokens = 0.014₽ per 1k tokens
UPDATE t_p56134400_telegram_ai_bot_pdf.token_usage
SET cost_rubles = (tokens_used / 1000.0) * 0.014
WHERE model = 'deepseek-chat' 
  AND operation_type = 'gpt_response' 
  AND cost_rubles = 0;

-- DeepSeek Reasoner: $0.55 per 1M tokens = 0.055₽ per 1k tokens
UPDATE t_p56134400_telegram_ai_bot_pdf.token_usage
SET cost_rubles = (tokens_used / 1000.0) * 0.055
WHERE model = 'deepseek-reasoner' 
  AND operation_type = 'gpt_response' 
  AND cost_rubles = 0;

-- GPT-4o-mini: примерно $0.15 per 1M = 0.015₽ per 1k
UPDATE t_p56134400_telegram_ai_bot_pdf.token_usage
SET cost_rubles = (tokens_used / 1000.0) * 0.015
WHERE model = 'gpt-4o-mini' 
  AND operation_type = 'gpt_response' 
  AND cost_rubles = 0;

-- GPT-3.5-turbo: примерно $0.50 per 1M = 0.050₽ per 1k
UPDATE t_p56134400_telegram_ai_bot_pdf.token_usage
SET cost_rubles = (tokens_used / 1000.0) * 0.050
WHERE model = 'gpt-3.5-turbo' 
  AND operation_type = 'gpt_response' 
  AND cost_rubles = 0;
