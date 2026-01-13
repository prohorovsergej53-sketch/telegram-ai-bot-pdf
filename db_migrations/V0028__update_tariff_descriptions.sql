-- Обновляем описания тарифов: везде ключи заказчика + публичный web-чат

UPDATE t_p56134400_telegram_ai_bot_pdf.tariff_plans
SET 
  features = jsonb_build_array(
    'Публичный web-чат на отдельной странице',
    'До 10 PDF документов',
    'Без интеграции мессенджеров',
    'Используем ваш API ключ YandexGPT',
    'Email поддержка'
  )
WHERE id = 'basic';

UPDATE t_p56134400_telegram_ai_bot_pdf.tariff_plans
SET 
  features = jsonb_build_array(
    'Всё из тарифа Старт',
    'Интеграция с Telegram',
    'До 25 PDF документов',
    'Используем ваш API ключ YandexGPT',
    'Статистика и аналитика',
    'Приоритетная поддержка'
  )
WHERE id = 'professional';

UPDATE t_p56134400_telegram_ai_bot_pdf.tariff_plans
SET 
  features = jsonb_build_array(
    'Всё из тарифа Бизнес',
    'Интеграция WhatsApp, VK, MAX (опционально)',
    'До 100 PDF документов',
    'Используем ваш API ключ YandexGPT',
    'Настройка и доработка нашими специалистами',
    'Личный менеджер проекта',
    'Кастомизация под ваши задачи',
    'SLA 99.9% uptime'
  )
WHERE id = 'enterprise';
