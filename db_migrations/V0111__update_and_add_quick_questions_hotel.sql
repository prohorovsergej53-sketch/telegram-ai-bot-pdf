-- Обновляем существующую запись
UPDATE t_p56134400_telegram_ai_bot_pdf.quick_questions
SET text = 'Номера', question = 'Какие категории номеров доступны?', icon = 'Home', sort_order = 1
WHERE id = 11;

-- Добавляем остальные быстрые вопросы
INSERT INTO t_p56134400_telegram_ai_bot_pdf.quick_questions (text, question, icon, sort_order) VALUES
('Цены', 'Сколько стоит проживание?', 'DollarSign', 2),
('Бронирование', 'Как забронировать номер?', 'Calendar', 3),
('Расположение', 'Где находится отель?', 'MapPin', 4);