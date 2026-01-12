-- Добавляем настройки для шапки страницы (иконка, название, слоган)

INSERT INTO t_p56134400_telegram_ai_bot_pdf.page_settings (setting_key, setting_value)
VALUES 
  ('header_icon', 'Hotel'),
  ('header_title', 'Отель Пушкин'),
  ('header_subtitle', 'AI Консьерж')
ON CONFLICT DO NOTHING;
