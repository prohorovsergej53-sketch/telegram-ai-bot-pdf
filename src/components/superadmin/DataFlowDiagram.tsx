import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const DataFlowDiagram = () => {
  return (
    <Card className="border-2 border-teal-200 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Icon name="Network" size={24} />
          Поток данных между компонентами
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-8 pb-8 bg-gradient-to-br from-slate-50 to-teal-50">
        <div className="space-y-8">
          
          {/* Frontend → Backend */}
          <div className="bg-white p-6 rounded-lg border-2 border-blue-300 shadow-lg">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <Icon name="Monitor" size={20} />
              Frontend → Backend (HTTP)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <p className="font-semibold text-blue-800 mb-2">📤 Запросы:</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• <code className="bg-white px-2 py-1 rounded">/chat</code> → отправка сообщения</li>
                  <li>• <code className="bg-white px-2 py-1 rounded">/auth-admin</code> → авторизация</li>
                  <li>• <code className="bg-white px-2 py-1 rounded">/get-documents</code> → список PDF</li>
                  <li>• <code className="bg-white px-2 py-1 rounded">/upload-pdf</code> → загрузка файла</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded border border-green-200">
                <p className="font-semibold text-green-800 mb-2">📥 Ответы:</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• JSON с данными</li>
                  <li>• JWT токен (Authorization)</li>
                  <li>• Статус операции (success/error)</li>
                  <li>• AI-ответ клиенту</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
              <p className="text-sm text-slate-700">
                <strong>⚠️ Важно:</strong> Заголовок <code className="bg-white px-2 py-1">X-Authorization</code> 
                (прокси фильтрует Authorization), передаётся tenant_id в body
              </p>
            </div>
          </div>

          {/* Backend → Database */}
          <div className="bg-white p-6 rounded-lg border-2 border-purple-300 shadow-lg">
            <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
              <Icon name="Database" size={20} />
              Backend → PostgreSQL (SQL)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-50 p-4 rounded border border-purple-200">
                <p className="font-semibold text-purple-800 mb-2">🔍 Чтение:</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• SELECT из <code>tenants</code> (по tenant_id)</li>
                  <li>• SELECT из <code>documents</code> (embeddings)</li>
                  <li>• SELECT из <code>ai_settings</code> (модель, промпт)</li>
                  <li>• SELECT из <code>chats, messages</code> (история)</li>
                </ul>
              </div>
              <div className="bg-pink-50 p-4 rounded border border-pink-200">
                <p className="font-semibold text-pink-800 mb-2">✏️ Запись:</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• INSERT в <code>messages</code> (user + assistant)</li>
                  <li>• INSERT в <code>chats</code> (новая сессия)</li>
                  <li>• UPDATE <code>tenants</code> (subscription_end_date)</li>
                  <li>• INSERT в <code>documents</code> (новый PDF)</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-300 rounded">
              <p className="text-sm text-slate-700">
                <strong>🔧 Протокол:</strong> Simple Query (psycopg2), НЕ Extended Query. 
                DSN из <code>DATABASE_URL</code> env переменной
              </p>
            </div>
          </div>

          {/* Backend → External APIs */}
          <div className="bg-white p-6 rounded-lg border-2 border-orange-300 shadow-lg">
            <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
              <Icon name="Cloud" size={20} />
              Backend → Внешние API
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-orange-50 p-4 rounded border border-orange-200">
                <p className="font-semibold text-orange-800 mb-2">🤖 YandexGPT</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• Model: yandexgpt-lite</li>
                  <li>• API Key из secrets</li>
                  <li>• Folder ID из secrets</li>
                  <li>• Запрос: messages[]</li>
                  <li>• Ответ: text</li>
                </ul>
              </div>
              <div className="bg-teal-50 p-4 rounded border border-teal-200">
                <p className="font-semibold text-teal-800 mb-2">🔗 OpenAI</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• Embeddings API</li>
                  <li>• Model: text-embedding-3-small</li>
                  <li>• Векторизация документов</li>
                  <li>• RAG-поиск</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded border border-green-200">
                <p className="font-semibold text-green-800 mb-2">💳 ЮKassa</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• Создание платежей</li>
                  <li>• Webhook: payment.succeeded</li>
                  <li>• Metadata → tenant_id</li>
                  <li>• Confirmation URL</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Webhooks → Backend */}
          <div className="bg-white p-6 rounded-lg border-2 border-indigo-300 shadow-lg">
            <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <Icon name="Webhook" size={20} />
              Внешние сервисы → Backend (Webhooks)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 p-4 rounded border border-indigo-200">
                <p className="font-semibold text-indigo-800 mb-2">📱 Telegram</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• /telegram-webhook</li>
                  <li>• update.message.text</li>
                  <li>• Определение tenant по bot_token</li>
                  <li>• Ответ через Telegram Bot API</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <p className="font-semibold text-blue-800 mb-2">👥 VK</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• /vk-webhook</li>
                  <li>• callback.message.text</li>
                  <li>• Определение tenant по group_id</li>
                  <li>• Ответ через VK API</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded border border-purple-200">
                <p className="font-semibold text-purple-800 mb-2">💬 MAX</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• /max-webhook</li>
                  <li>• event.message</li>
                  <li>• Определение tenant по channel_id</li>
                  <li>• Ответ через MAX API</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cron Jobs */}
          <div className="bg-white p-6 rounded-lg border-2 border-yellow-300 shadow-lg">
            <h3 className="text-xl font-bold text-yellow-900 mb-4 flex items-center gap-2">
              <Icon name="Clock" size={20} />
              Cron Jobs (автоматические задачи)
            </h3>
            <div className="space-y-3">
              <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                <p className="font-semibold text-yellow-800 mb-2">⏰ check-subscriptions</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• <strong>Частота:</strong> каждые 24 часа (Yandex Cloud Triggers)</li>
                  <li>• <strong>Триггер:</strong> internal-cron-trigger → check-subscriptions</li>
                  <li>• <strong>Логика:</strong> SQL запрос WHERE subscription_end_date BETWEEN NOW() AND NOW()+3 days</li>
                  <li>• <strong>Действие:</strong> отправка email через send-email (Yandex Postbox)</li>
                  <li>• <strong>Данные:</strong> tenant_name, tariff_name, renewal_price, renewal_url</li>
                </ul>
              </div>
              <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded">
                <p className="text-sm text-slate-700">
                  <strong>✅ Важно:</strong> Cron НЕ блокирует tenant при истечении. 
                  Только отправляет напоминание. Клиент может продолжать использовать бота.
                </p>
              </div>
            </div>
          </div>

          {/* Storage (S3) */}
          <div className="bg-white p-6 rounded-lg border-2 border-rose-300 shadow-lg">
            <h3 className="text-xl font-bold text-rose-900 mb-4 flex items-center gap-2">
              <Icon name="HardDrive" size={20} />
              Backend → S3 Storage (файлы)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-rose-50 p-4 rounded border border-rose-200">
                <p className="font-semibold text-rose-800 mb-2">📤 Загрузка:</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• <strong>Endpoint:</strong> bucket.poehali.dev</li>
                  <li>• <strong>Bucket:</strong> 'files' (всегда)</li>
                  <li>• <strong>Key:</strong> documents/tenant_{'{'}id{'}'}/file.pdf</li>
                  <li>• <strong>SDK:</strong> boto3 (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <p className="font-semibold text-blue-800 mb-2">🔗 CDN доступ:</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• <strong>URL:</strong> cdn.poehali.dev/projects/{'{'}AWS_ACCESS_KEY_ID{'}'}/bucket/...</li>
                  <li>• <strong>Публичный доступ:</strong> через CDN</li>
                  <li>• <strong>НЕ используется:</strong> PROJECT_ID (только AWS_ACCESS_KEY_ID)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Email System */}
          <div className="bg-white p-6 rounded-lg border-2 border-violet-300 shadow-lg">
            <h3 className="text-xl font-bold text-violet-900 mb-4 flex items-center gap-2">
              <Icon name="Mail" size={20} />
              Backend → Email (Yandex Cloud Postbox)
            </h3>
            <div className="space-y-3">
              <div className="bg-violet-50 p-4 rounded border border-violet-200">
                <p className="font-semibold text-violet-800 mb-2">📧 Типы писем:</p>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li>
                    <strong>1. order_confirmation</strong> (после оплаты):
                    <ul className="ml-4 mt-1 list-disc">
                      <li>Отправка: yookassa-webhook → send-order-email</li>
                      <li>Данные: customer_name, customer_email, tariff_name, amount, login_url, username, password</li>
                      <li>Шаблон: HTML с брендингом, инструкцией, контактами</li>
                    </ul>
                  </li>
                  <li>
                    <strong>2. subscription_reminder</strong> (за 3 дня):
                    <ul className="ml-4 mt-1 list-disc">
                      <li>Отправка: check-subscriptions (cron) → send-email</li>
                      <li>Данные: tenant_name, tariff_name, renewal_price, renewal_url, subscription_end_date</li>
                      <li>Содержание: напоминание + ссылка на продление (ai-ru.ru/content-editor?tenant_id=X)</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

export default DataFlowDiagram;
