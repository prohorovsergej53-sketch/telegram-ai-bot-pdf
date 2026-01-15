import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const FlowStepDetails = () => {
  return (
    <Card className="border-2 border-purple-200 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Icon name="Workflow" size={24} />
          Детальное описание этапов
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-8">
          
          {/* Этап 1: Заход клиента */}
          <div className="relative pl-8 pb-8 border-l-4 border-blue-500">
            <div className="absolute -left-4 top-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              1
            </div>
            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Icon name="Globe" size={20} />
                Клиент заходит на landing
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-slate-700"><strong>URL:</strong> <code className="bg-white px-2 py-1 rounded">https://ai-ru.ru/</code></p>
                <p className="text-slate-700"><strong>Компоненты:</strong> PricingSection, FeaturesSection, HowItWorksSection, FAQSection</p>
                <p className="text-slate-700"><strong>Видит:</strong> 3 тарифа с возможностью подключения за 1 час</p>
                <div className="bg-white p-3 rounded mt-2 border border-blue-300">
                  <p className="font-semibold text-blue-800">🎯 Цель этапа:</p>
                  <p className="text-slate-700">Заинтересовать клиента, показать ценность → переход к оплате</p>
                </div>
              </div>
            </div>
          </div>

          {/* Этап 2: Выбор тарифа */}
          <div className="relative pl-8 pb-8 border-l-4 border-green-500">
            <div className="absolute -left-4 top-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              2
            </div>
            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
              <h3 className="text-xl font-bold text-green-900 mb-3 flex items-center gap-2">
                <Icon name="CreditCard" size={20} />
                Выбор тарифа и оплата
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-slate-700"><strong>Действие:</strong> Клик на кнопку "Начать" в карточке тарифа</p>
                <p className="text-slate-700"><strong>Backend:</strong> <code className="bg-white px-2 py-1 rounded">/backend/yookassa-create-payment/</code></p>
                <p className="text-slate-700"><strong>Интеграция:</strong> ЮKassa API (создание платежа)</p>
                <div className="bg-white p-3 rounded mt-2 border border-green-300">
                  <p className="font-semibold text-green-800">💳 Тарифы (из БД):</p>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    <li><strong>basic:</strong> 1 € первый месяц (setup_fee) → 11 €/мес (renewal_price)</li>
                    <li><strong>professional:</strong> 5 € первый месяц → 30 €/мес</li>
                    <li><strong>enterprise:</strong> 9 € первый месяц → 60 €/мес</li>
                  </ul>
                  <p className="text-xs text-slate-600 mt-2">Лимиты: basic=500 сообщ/мес, professional=3000, enterprise=10000</p>
                </div>
                <div className="bg-white p-3 rounded mt-2 border border-green-300">
                  <p className="font-semibold text-green-800">💳 Процесс оплаты:</p>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    <li>Frontend отправляет metadata: email, phone, tariff_id, tenant_name</li>
                    <li>Backend создаёт платёж в ЮKassa → получение payment_url</li>
                    <li>Редирект клиента на страницу оплаты ЮKassa</li>
                    <li>После оплаты: webhook на <code className="bg-slate-100 px-1">/backend/yookassa-webhook/</code></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Этап 3: Обработка payment webhook */}
          <div className="relative pl-8 pb-8 border-l-4 border-yellow-500">
            <div className="absolute -left-4 top-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              3
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
              <h3 className="text-xl font-bold text-yellow-900 mb-3 flex items-center gap-2">
                <Icon name="Webhook" size={20} />
                Webhook от ЮKassa: создание tenant
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-slate-700"><strong>Backend:</strong> <code className="bg-white px-2 py-1 rounded">/backend/yookassa-webhook/index.py</code></p>
                <p className="text-slate-700"><strong>Событие:</strong> <code>payment.succeeded</code></p>
                <div className="bg-white p-3 rounded mt-2 border border-yellow-300">
                  <p className="font-semibold text-yellow-800">⚙️ Логика обработки:</p>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    <li>Проверка статуса платежа (succeeded)</li>
                    <li>Извлечение metadata: email, phone, tenant_name, tariff_id</li>
                    <li><strong>Создание tenant в БД:</strong> INSERT INTO tenants (БЕЗ копирования шаблона)</li>
                    <li>Генерация уникального slug: generate_random_slug() (например: bot-a8f3d2)</li>
                    <li>Создание admin-пользователя (username=email, случайный пароль)</li>
                    <li>Установка tariff_id и subscription_end_date (тариф + 30 дней)</li>
                    <li>Отправка email с доступами через send-order-email</li>
                  </ul>
                </div>
                <div className="bg-blue-100 p-3 rounded mt-2 border border-blue-400">
                  <p className="font-semibold text-blue-900">📊 Таблицы БД:</p>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    <li><code>tenants</code>: id, name, slug, tariff_id, subscription_end_date, owner_email, owner_phone</li>
                    <li><code>users</code>: id, tenant_id, username (=email), password_hash, is_superadmin</li>
                  </ul>
                  <p className="text-xs text-slate-600 mt-2">
                    <strong>Важно:</strong> Теперь роутинг через tenant_id, а НЕ через slug в URL. 
                    Пользователь получает прямую ссылку: /content-editor?tenant_id=123
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Этап 4: Email с доступами */}
          <div className="relative pl-8 pb-8 border-l-4 border-purple-500">
            <div className="absolute -left-4 top-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              4
            </div>
            <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
              <h3 className="text-xl font-bold text-purple-900 mb-3 flex items-center gap-2">
                <Icon name="Mail" size={20} />
                Email-уведомления
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-slate-700"><strong>Backend:</strong> <code className="bg-white px-2 py-1 rounded">/backend/send-order-email/</code></p>
                <div className="bg-white p-3 rounded mt-2 border border-purple-300">
                  <p className="font-semibold text-purple-800">📧 Система email-уведомлений:</p>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    <li><strong>Backend:</strong> /backend/send-order-email/ (Yandex Cloud Postbox)</li>
                    <li><strong>Шаблон:</strong> HTML-письмо с брендингом, логином, паролем, прямой ссылкой</li>
                    <li><strong>Данные:</strong> имя клиента, email, телефон, тариф, сумма, payment_id</li>
                    <li><strong>Дополнительно:</strong> инструкция по входу, контакты поддержки</li>
                  </ul>
                  <p className="text-xs text-slate-600 mt-2">
                    <strong>Типы писем:</strong> order_confirmation (после оплаты), subscription_reminder (за 3 дня до окончания)
                  </p>
                </div>
                <div className="bg-white p-3 rounded mt-2 border border-purple-300 space-y-2">
                  <p className="font-semibold text-purple-800">✉️ Клиенту отправляется:</p>
                  <p className="text-slate-700">🔗 <strong>URL админки:</strong> <code className="bg-slate-100 px-2 py-1">https://ai-ru.ru/content-editor?tenant_id=[id]</code></p>
                  <p className="text-slate-700">👤 <strong>Логин (email):</strong> email клиента</p>
                  <p className="text-slate-700">🔑 <strong>Пароль:</strong> случайный (8-12 символов)</p>
                  <p className="text-slate-700">📋 <strong>Детали:</strong> название тарифа, сумма платежа, payment_id</p>
                </div>
              </div>
            </div>
          </div>

          {/* Этап 5: Вход в админку */}
          <div className="relative pl-8 pb-8 border-l-4 border-red-500">
            <div className="absolute -left-4 top-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              5
            </div>
            <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
              <h3 className="text-xl font-bold text-red-900 mb-3 flex items-center gap-2">
                <Icon name="Lock" size={20} />
                Авторизация в админ-панели
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-slate-700"><strong>URL:</strong> <code className="bg-white px-2 py-1 rounded">https://ai-ru.ru/content-editor?tenant_id=[id]</code></p>
                <p className="text-slate-700"><strong>Компонент:</strong> <code>src/pages/Admin.tsx</code> → AdminView.tsx</p>
                <p className="text-slate-700"><strong>Backend:</strong> <code className="bg-white px-2 py-1 rounded">/backend/auth-admin/index.py</code></p>
                <div className="bg-white p-3 rounded mt-2 border border-red-300">
                  <p className="font-semibold text-red-800">🔐 Процесс авторизации:</p>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    <li>Клиент вводит email + password на /content-editor?tenant_id=X</li>
                    <li>Backend /auth-admin проверяет: tenant_id + username (email) + пароль</li>
                    <li>Генерация JWT токена (payload: user_id, tenant_id, is_superadmin)</li>
                    <li>Сохранение токена в localStorage</li>
                    <li>Заголовок X-Authorization (из-за фильтрации прокси)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Этап 6: Настройка бота */}
          <div className="relative pl-8 pb-8 border-l-4 border-indigo-500">
            <div className="absolute -left-4 top-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              6
            </div>
            <div className="bg-indigo-50 p-6 rounded-lg border-2 border-indigo-200">
              <h3 className="text-xl font-bold text-indigo-900 mb-3 flex items-center gap-2">
                <Icon name="Settings" size={20} />
                Клиент настраивает бота
              </h3>
              <div className="space-y-3 text-sm">
                <p className="text-slate-700"><strong>Компонент:</strong> AdminView.tsx с вкладками (Tabs)</p>
                
                <div className="bg-white p-4 rounded border border-indigo-300 space-y-3">
                  <div>
                    <p className="font-semibold text-indigo-800 flex items-center gap-2">
                      <Icon name="FileText" size={16} />
                      📄 Вкладка "Документы"
                    </p>
                    <ul className="list-disc list-inside text-slate-700 ml-4 mt-1">
                      <li>Загрузка PDF: <code>/backend/upload-pdf/</code></li>
                      <li>Обработка и vectorization: <code>/backend/process-pdf/</code></li>
                      <li>Хранение в БД: таблица <code>documents</code></li>
                      <li>Лимит документов зависит от tariff_id</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-indigo-800 flex items-center gap-2">
                      <Icon name="MessageCircle" size={16} />
                      💬 Вкладка "Мессенджеры"
                    </p>
                    <ul className="list-disc list-inside text-slate-700 ml-4 mt-1">
                      <li><strong>Telegram:</strong> TelegramSettingsCard → ввод bot_token → webhook setup</li>
                      <li><strong>VK:</strong> VKSettingsCard → ввод access_token, group_id → callback setup</li>
                      <li><strong>MAX:</strong> MAXSettingsCard → ввод channel_id, api_key</li>
                      <li>Хранение: таблица <code>messenger_api_keys</code> (provider, tenant_id, api_key, bot_token...)</li>
                      <li>Доступ по тарифу: basic = без мессенджеров, professional = Telegram, premium = все</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-indigo-800 flex items-center gap-2">
                      <Icon name="Brain" size={16} />
                      🧠 Вкладка "AI"
                    </p>
                    <ul className="list-disc list-inside text-slate-700 ml-4 mt-1">
                      <li>AISettingsCard: YandexGPT (yandexgpt-lite) и настройки</li>
                      <li>Настройка параметров: temperature, max_tokens, system_prompt</li>
                      <li>Backend: <code>/backend/get-ai-settings/</code>, <code>/backend/update-ai-settings/</code></li>
                      <li>Хранение: таблица <code>ai_settings</code> (tenant_id, model, settings_json)</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-indigo-800 flex items-center gap-2">
                      <Icon name="Layout" size={16} />
                      🎨 Вкладка "Страница"
                    </p>
                    <ul className="list-disc list-inside text-slate-700 ml-4 mt-1">
                      <li>PageSettingsCard: настройка текстов публичной страницы</li>
                      <li>Заголовки, подзаголовки, контакты, быстрые вопросы</li>
                      <li>Backend: <code>/backend/get-page-settings/</code>, <code>/backend/update-page-settings/</code></li>
                      <li>Хранение: таблица <code>page_settings</code></li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-indigo-800 flex items-center gap-2">
                      <Icon name="Code" size={16} />
                      🛠️ Вкладка "Виджет"
                    </p>
                    <ul className="list-disc list-inside text-slate-700 ml-4 mt-1">
                      <li>WidgetSettingsCard: настройка встраиваемого чат-виджета</li>
                      <li>Выбор иконки (IconPicker), цветов, позиции</li>
                      <li>Генерация кода для встройки на любой сайт</li>
                      <li>Backend: <code>/backend/get-widget-settings/</code>, <code>/backend/update-widget-settings/</code></li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-indigo-800 flex items-center gap-2">
                      <Icon name="BarChart" size={16} />
                      📊 Вкладка "Статистика"
                    </p>
                    <ul className="list-disc list-inside text-slate-700 ml-4 mt-1">
                      <li>ChatStatsCard: аналитика по сообщениям</li>
                      <li>Количество диалогов, сообщений, качество ответов</li>
                      <li>Backend: <code>/backend/get-chat-stats/</code></li>
                      <li>Данные из таблиц: <code>chats</code>, <code>messages</code></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Этап 7: Ежемесячное продление */}
          <div className="relative pl-8 pb-8 border-l-4 border-orange-500">
            <div className="absolute -left-4 top-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              7
            </div>
            <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
              <h3 className="text-xl font-bold text-orange-900 mb-3 flex items-center gap-2">
                <Icon name="Calendar" size={20} />
                Ежемесячное продление подписки
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-slate-700"><strong>Backend:</strong> <code className="bg-white px-2 py-1 rounded">/backend/check-subscriptions/</code></p>
                <div className="bg-white p-3 rounded mt-2 border border-orange-300">
                  <p className="font-semibold text-orange-800">⏰ Автоматическая проверка (cron):</p>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    <li><strong>Запуск:</strong> ежедневно через cron (internal-cron-trigger → check-subscriptions)</li>
                    <li><strong>Функция:</strong> <code>/backend/check-subscriptions/index.py</code></li>
                    <li><strong>Таймер:</strong> Yandex Cloud Triggers (настройка через setup-cronjob)</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded mt-2 border border-orange-300">
                  <p className="font-semibold text-orange-800">📧 Система уведомлений:</p>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    <li><strong>За 3 дня до окончания:</strong> письмо с напоминанием и ссылкой на продление</li>
                    <li><strong>URL продления:</strong> https://ai-ru.ru/content-editor?tenant_id=X</li>
                    <li><strong>Отправка:</strong> Yandex Cloud Postbox (send-email)</li>
                    <li><strong>Данные:</strong> название тенанта, тариф, цена продления, дата окончания</li>
                  </ul>
                  <p className="text-xs text-slate-600 mt-2">
                    <strong>Технически:</strong> Cron каждые 24 часа через internal-cron-trigger → check-subscriptions → 
                    SQL: запрос tenants WHERE subscription_end_date BETWEEN NOW() AND NOW()+3 days → отправка email
                  </p>
                </div>
                <div className="bg-white p-3 rounded mt-2 border border-orange-300">
                  <p className="font-semibold text-orange-800">🔒 Продление:</p>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    <li>Клиент переходит по ссылке в админку ai-ru.ru/content-editor</li>
                    <li>В админке видит статус подписки и кнопку продления</li>
                    <li>При оплате: subscription_end_date += 30 дней</li>
                    <li>При неоплате: бот продолжает работать (без автоблокировки)</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded mt-2 border border-orange-300">
                  <p className="font-semibold text-orange-800">💳 Тарифы и цены:</p>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    <li><strong>basic:</strong> 1 € (первый месяц) → 11 €/мес (трафик 500 сообщ/мес)</li>
                    <li><strong>professional:</strong> 5 € (первый месяц) → 30 €/мес (трафик 3000 сообщ/мес)</li>
                    <li><strong>enterprise:</strong> 9 € (первый месяц) → 60 €/мес (трафик 10000 сообщ/мес)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Этап 8: Работа бота */}
          <div className="relative pl-8">
            <div className="absolute -left-4 top-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              8
            </div>
            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300">
              <h3 className="text-xl font-bold text-green-900 mb-3 flex items-center gap-2">
                <Icon name="Zap" size={20} />
                Бот работает и отвечает клиентам
              </h3>
              <div className="space-y-3 text-sm">
                <p className="text-slate-700"><strong>Каналы коммуникации:</strong></p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded border border-green-300">
                    <p className="font-semibold text-green-800">🌐 Web-чат (публичная страница)</p>
                    <ul className="list-disc list-inside text-slate-700 text-xs mt-1">
                      <li>URL: <code>/[slug]</code></li>
                      <li>Компонент: HotelChatbotView.tsx</li>
                      <li>API: <code>/backend/chat/</code></li>
                    </ul>
                  </div>

                  <div className="bg-white p-3 rounded border border-green-300">
                    <p className="font-semibold text-green-800">📱 Telegram бот</p>
                    <ul className="list-disc list-inside text-slate-700 text-xs mt-1">
                      <li>Webhook: <code>/backend/telegram-webhook/</code></li>
                      <li>Получение update → обработка → ответ через Bot API</li>
                    </ul>
                  </div>

                  <div className="bg-white p-3 rounded border border-green-300">
                    <p className="font-semibold text-green-800">👥 VK бот</p>
                    <ul className="list-disc list-inside text-slate-700 text-xs mt-1">
                      <li>Webhook: <code>/backend/vk-webhook/</code></li>
                      <li>Callback API → обработка → ответ через VK API</li>
                    </ul>
                  </div>

                  <div className="bg-white p-3 rounded border border-green-300">
                    <p className="font-semibold text-green-800">💬 MAX.ru бот</p>
                    <ul className="list-disc list-inside text-slate-700 text-xs mt-1">
                      <li>Webhook: <code>/backend/max-webhook/</code></li>
                      <li>События → обработка → ответ через MAX API</li>
                    </ul>
                  </div>

                  <div className="bg-white p-3 rounded border border-green-300">
                    <p className="font-semibold text-green-800">🛠️ Виджет на сайте клиента</p>
                    <ul className="list-disc list-inside text-slate-700 text-xs mt-1">
                      <li>Embed код с iframe или script</li>
                      <li>API: <code>/backend/chat/</code></li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white p-4 rounded border-2 border-green-400 mt-3">
                  <p className="font-semibold text-green-900 mb-2">🤖 Логика обработки сообщения:</p>
                  <ol className="list-decimal list-inside text-slate-700 space-y-1 text-xs">
                    <li>Пользователь отправляет сообщение в любой канал</li>
                    <li>Webhook получает событие → определяет tenant_id</li>
                    <li>Загрузка AI settings, документов из БД для этого tenant</li>
                    <li>RAG-поиск: векторное сходство (OpenAI embeddings) → релевантные фрагменты</li>
                    <li>Формирование контекста: system_prompt + найденные фрагменты документов</li>
                    <li>Отправка запроса в YandexGPT (yandexgpt-lite)</li>
                    <li>Получение ответа от AI</li>
                    <li>Отправка ответа пользователю через соответствующий API</li>
                    <li>Сохранение сообщений в БД: таблицы <code>chats</code>, <code>messages</code></li>
                    <li>Обновление статистики для аналитики</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

export default FlowStepDetails;