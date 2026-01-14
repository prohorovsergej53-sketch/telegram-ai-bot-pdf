import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const LogicFlowTab = () => {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-200 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Icon name="Workflow" size={24} />
            Схема работы платформы: от захода до настройки бота
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
                  <p className="text-slate-700"><strong>URL:</strong> <code className="bg-white px-2 py-1 rounded">https://mysite.com/</code></p>
                  <p className="text-slate-700"><strong>Компоненты:</strong> PricingSection, FeaturesSection, HowItWorksSection, FAQSection</p>
                  <p className="text-slate-700"><strong>Видит:</strong> Тарифы (Старт, Бизнес, Премиум), возможности, FAQ</p>
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
                    <p className="font-semibold text-green-800">💳 Процесс оплаты:</p>
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                      <li>Создание платежа в ЮKassa → получение payment_url</li>
                      <li>Редирект клиента на страницу оплаты ЮKassa</li>
                      <li>Клиент вводит данные карты и подтверждает</li>
                      <li>ЮKassa отправляет webhook на <code className="bg-slate-100 px-1">/backend/yookassa-webhook/</code></li>
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
                      <li>Извлечение metadata: email, tariff_id из платежа</li>
                      <li><strong>Создание tenant в БД:</strong> INSERT INTO tenants</li>
                      <li>Генерация уникального slug (например: bot-12345)</li>
                      <li>Создание admin-пользователя для tenant</li>
                      <li>Генерация случайного пароля и отправка на email</li>
                      <li>Установка tariff_id и subscription_end_date</li>
                    </ul>
                  </div>
                  <div className="bg-blue-100 p-3 rounded mt-2 border border-blue-400">
                    <p className="font-semibold text-blue-900">📊 Таблицы БД:</p>
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                      <li><code>tenants</code>: id, name, slug, tariff_id, subscription_end_date, created_at</li>
                      <li><code>users</code>: id, tenant_id, username, password_hash, is_superadmin</li>
                    </ul>
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
                  Клиент получает доступы
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-700"><strong>Email содержит:</strong></p>
                  <div className="bg-white p-3 rounded mt-2 border border-purple-300 space-y-2">
                    <p className="text-slate-700">✉️ <strong>Тема:</strong> "Ваш бот готов к настройке!"</p>
                    <p className="text-slate-700">🔗 <strong>URL админки:</strong> <code className="bg-slate-100 px-2 py-1">https://mysite.com/[slug]/admin</code></p>
                    <p className="text-slate-700">👤 <strong>Логин:</strong> admin</p>
                    <p className="text-slate-700">🔑 <strong>Пароль:</strong> [сгенерированный случайный]</p>
                    <p className="text-slate-700">📱 <strong>Публичная страница бота:</strong> <code className="bg-slate-100 px-2 py-1">https://mysite.com/[slug]</code></p>
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
                  <p className="text-slate-700"><strong>URL:</strong> <code className="bg-white px-2 py-1 rounded">/[slug]/admin</code></p>
                  <p className="text-slate-700"><strong>Компонент:</strong> <code>src/pages/Admin.tsx</code> → AdminView.tsx</p>
                  <p className="text-slate-700"><strong>Backend:</strong> <code className="bg-white px-2 py-1 rounded">/backend/auth-admin/index.py</code></p>
                  <div className="bg-white p-3 rounded mt-2 border border-red-300">
                    <p className="font-semibold text-red-800">🔐 Процесс авторизации:</p>
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                      <li>Клиент вводит username + password</li>
                      <li>Backend проверяет credentials в таблице users</li>
                      <li>Проверка tenant_id (slug из URL → tenant.id)</li>
                      <li>Генерация JWT токена с данными: tenant_id, user_id, tariff_id</li>
                      <li>Сохранение токена в localStorage</li>
                      <li>Frontend использует токен для всех API запросов</li>
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
                        <li>AISettingsCard: выбор модели (YandexGPT / OpenAI)</li>
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

            {/* Этап 7: Работа бота */}
            <div className="relative pl-8">
              <div className="absolute -left-4 top-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                7
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
                      <li>Формирование контекста: system_prompt + документы (RAG)</li>
                      <li>Отправка запроса в AI (YandexGPT / OpenAI)</li>
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

          {/* Итоговая схема */}
          <Card className="mt-8 border-4 border-gradient-to-r from-purple-500 to-blue-500">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Icon name="CheckCircle" size={24} className="text-green-600" />
                Ключевые таблицы БД
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 p-4 rounded border">
                  <p className="font-bold text-slate-900 mb-2">👥 tenants</p>
                  <p className="text-xs text-slate-600">id, name, slug, tariff_id, subscription_end_date, created_at</p>
                </div>
                <div className="bg-slate-50 p-4 rounded border">
                  <p className="font-bold text-slate-900 mb-2">🔐 users</p>
                  <p className="text-xs text-slate-600">id, tenant_id, username, password_hash, is_superadmin</p>
                </div>
                <div className="bg-slate-50 p-4 rounded border">
                  <p className="font-bold text-slate-900 mb-2">💳 tariffs</p>
                  <p className="text-xs text-slate-600">id, name, price, period, is_active</p>
                </div>
                <div className="bg-slate-50 p-4 rounded border">
                  <p className="font-bold text-slate-900 mb-2">📄 documents</p>
                  <p className="text-xs text-slate-600">id, tenant_id, filename, content, embeddings, created_at</p>
                </div>
                <div className="bg-slate-50 p-4 rounded border">
                  <p className="font-bold text-slate-900 mb-2">🔑 messenger_api_keys</p>
                  <p className="text-xs text-slate-600">id, tenant_id, provider (telegram/vk/max), api_key, bot_token</p>
                </div>
                <div className="bg-slate-50 p-4 rounded border">
                  <p className="font-bold text-slate-900 mb-2">🧠 ai_settings</p>
                  <p className="text-xs text-slate-600">id, tenant_id, model (yandexgpt/openai), settings_json</p>
                </div>
                <div className="bg-slate-50 p-4 rounded border">
                  <p className="font-bold text-slate-900 mb-2">💬 chats</p>
                  <p className="text-xs text-slate-600">id, tenant_id, channel (web/telegram/vk/max), user_id, created_at</p>
                </div>
                <div className="bg-slate-50 p-4 rounded border">
                  <p className="font-bold text-slate-900 mb-2">✉️ messages</p>
                  <p className="text-xs text-slate-600">id, chat_id, role (user/assistant), content, timestamp</p>
                </div>
                <div className="bg-slate-50 p-4 rounded border">
                  <p className="font-bold text-slate-900 mb-2">🎨 page_settings</p>
                  <p className="text-xs text-slate-600">tenant_id, header_title, header_subtitle, contact_phone...</p>
                </div>
                <div className="bg-slate-50 p-4 rounded border">
                  <p className="font-bold text-slate-900 mb-2">🛠️ widget_settings</p>
                  <p className="text-xs text-slate-600">tenant_id, icon, position, primary_color, embed_code</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogicFlowTab;