-- Сброс счетчика неудачных попыток входа
UPDATE t_p56134400_telegram_ai_bot_pdf.login_attempts 
SET success = true 
WHERE success = false;