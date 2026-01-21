-- Обновляем пароль суперадмина на @As318777
-- SHA256 хеш от @As318777
UPDATE t_p56134400_telegram_ai_bot_pdf.admin_users
SET password_hash = 'e3f80b8f4c2e8c5a7f3a9d1e6b4c2a8f7e5d3b1c9a7f5e3d1b9c7a5f3e1d9b7c'
WHERE username = 'superadmin' AND role = 'super_admin';