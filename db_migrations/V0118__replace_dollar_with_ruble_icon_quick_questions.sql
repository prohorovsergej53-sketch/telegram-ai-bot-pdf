-- Заменить иконку доллара на рубль в быстрых вопросах для tenant_id=2
UPDATE t_p56134400_telegram_ai_bot_pdf.quick_questions
SET icon = 'Banknote'
WHERE tenant_id = 2 AND icon = 'DollarSign';
