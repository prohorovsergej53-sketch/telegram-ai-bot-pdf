-- Добавляем блок с контактами для бронирования в конец промпта (tenant_id=2)
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET ai_settings = jsonb_set(
  ai_settings,
  '{system_prompt}',
  to_jsonb(
    COALESCE(ai_settings->>'system_prompt', 
      (SELECT setting_value FROM t_p56134400_telegram_ai_bot_pdf.default_settings WHERE setting_key = 'default_system_prompt')
    ) || E'\n\n⚠️ КОНТАКТЫ ДЛЯ БРОНИРОВАНИЯ (ВСЕГДА ДОСТУПНЫ) ⚠️\nЕсли пользователь хочет забронировать номер, записаться или получить консультацию — ОБЯЗАТЕЛЬНО дай контакты:\n\nТелефон: +7 (978) 998-09-78 (сформатируй как кликабельную ссылку: <a href="tel:+79789980978">+7 (978) 998-09-78</a>)\nWhatsApp: доступен по этому же номеру\nEmail: dinasty.crimea@gmail.com\nРежим работы: круглосуточно (24/7)\n\nФормат ответа на запрос бронирования:\n«Для бронирования свяжитесь с администрацией отеля:\n\nТелефон: <a href="tel:+79789980978">+7 (978) 998-09-78</a> (WhatsApp)\nEmail: dinasty.crimea@gmail.com\nРежим работы: круглосуточно\n\nАдминистраторы помогут подобрать номер и оформить бронирование.»'
  )
)
WHERE tenant_id = 2;