-- Переименовываем колонку last_login в last_login_at
ALTER TABLE t_p56134400_telegram_ai_bot_pdf.admin_users 
RENAME COLUMN last_login TO last_login_at;