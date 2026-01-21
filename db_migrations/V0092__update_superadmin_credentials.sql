-- Обновление логина и пароля super_admin
-- Новый логин: iipoxop
-- Новый пароль: @As318777 (SHA256 хеш)

UPDATE t_p56134400_telegram_ai_bot_pdf.admin_users 
SET 
  username = 'iipoxop',
  password_hash = '7e9c8c6e5b5f5c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c',
  updated_at = NOW()
WHERE role = 'super_admin';