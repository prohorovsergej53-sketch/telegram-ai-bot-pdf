-- Обновление пароля super_admin с правильным SHA256 хешем
-- Пароль: @As318777
UPDATE t_p56134400_telegram_ai_bot_pdf.admin_users 
SET 
  password_hash = 'b8869c5760713b559cc932cccd231572e8284f7192c77374a371ee2a399fac6a',
  updated_at = NOW()
WHERE role = 'super_admin';