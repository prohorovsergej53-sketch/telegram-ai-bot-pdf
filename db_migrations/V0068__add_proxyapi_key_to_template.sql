-- Добавление API-ключа ProxyAPI в шаблон (tenant_id=1)
-- Используем заглушку, которая будет заменена на реальный ключ из секрета при использовании
INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenant_api_keys 
(tenant_id, provider, key_name, key_value, is_active)
VALUES 
(1, 'proxyapi', 'api_key', 'sk-proxy-placeholder', true)
ON CONFLICT DO NOTHING;