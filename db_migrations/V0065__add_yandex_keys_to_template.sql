-- Добавление API-ключей Яндекса в шаблон (tenant_id=1)
INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenant_api_keys 
(tenant_id, provider, key_name, key_value, is_active)
VALUES 
(1, 'yandex', 'api_key', 'AQVN1wJtVsslFJKFz96aRQAWOhJPp3wEKdlrcmh-', true),
(1, 'yandex', 'folder_id', 'b1gj0a1h5t23c9jtkutu', true);