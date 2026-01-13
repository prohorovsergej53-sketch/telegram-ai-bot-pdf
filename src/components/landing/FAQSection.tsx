import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Как быстро можно запустить AI-консультанта?',
      answer: 'На тарифах Старт и Бизнес вы получаете доступ сразу после оплаты. Загружаете документы, настраиваете — и бот готов работать в тот же день. На тарифе Премиум личный менеджер всё настроит за вас в течение 24 часов.'
    },
    {
      question: 'Нужны ли технические знания для настройки?',
      answer: 'Абсолютно нет! Интерфейс простой как у мессенджера. Загружаете PDF с прайсами и инструкциями, пишете приветствие — и готово. Всё на русском языке, с подсказками на каждом шаге.'
    },
    {
      question: 'Как бот узнаёт информацию о моём бизнесе?',
      answer: 'Вы загружаете документы в формате PDF (прайсы, правила, описания услуг). Бот анализирует их и запоминает всю информацию. Когда клиент задаёт вопрос, бот находит нужную информацию в ваших документах и формирует точный ответ.'
    },
    {
      question: 'Насколько точно бот отвечает на вопросы?',
      answer: 'Точность ответов 97%. Бот отвечает строго по вашим документам, не придумывает информацию. Если в документах нет ответа, бот честно говорит об этом и предлагает связаться с менеджером.'
    },
    {
      question: 'В каких каналах может работать AI-консультант?',
      answer: 'Во всех тарифах доступны: web-чат на отдельной странице и виджет для встраивания на ваш сайт. На тарифе Бизнес добавляется Telegram. На тарифе Премиум — все мессенджеры (Telegram, WhatsApp, VK, MAX). Один бот работает во всех каналах одновременно с единой базой знаний.'
    },
    {
      question: 'Как защищены данные клиентов?',
      answer: 'Мы полностью соответствуем 152-ФЗ. Все данные хранятся на серверах в России (Яндекс.Облако). Используем шифрование TLS 1.3 для передачи и AES-256 для хранения. Регулярные аудиты безопасности.'
    },
    {
      question: 'Что входит в первый платёж и продление?',
      answer: 'Первый платёж включает полную настройку системы, подключение всех функций, загрузку документов и обучение использованию. Продление — это только поддержка работы бота: хостинг, API, обновления, техподдержка.'
    },
    {
      question: 'Можно ли попробовать перед покупкой?',
      answer: 'Да! У нас есть демо-версия бота, где вы можете задать вопросы и посмотреть, как работает AI-консультант. Также мы предоставляем гарантию возврата в течение 14 дней, если вас что-то не устроит.'
    }
  ];

  return (
    <div className="bg-slate-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Частые вопросы
            </h2>
            <p className="text-xl text-slate-600">
              Отвечаем на всё, что может вас волновать
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  openIndex === index ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      openIndex === index ? 'bg-primary' : 'bg-slate-100'
                    }`}>
                      <Icon
                        name={openIndex === index ? 'ChevronUp' : 'ChevronDown'}
                        size={24}
                        className={openIndex === index ? 'text-white' : 'text-slate-600'}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {faq.question}
                      </h3>
                      {openIndex === index && (
                        <p className="text-slate-600 leading-relaxed animate-fade-in">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-primary to-blue-600 border-0">
              <CardContent className="py-8">
                <Icon name="MessageCircle" size={48} className="mx-auto text-white mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  Остались вопросы?
                </h3>
                <p className="text-blue-100 mb-6">
                  Напишите в MAX.ru или чат-боту — ответим мгновенно
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://max.ru/spa/ai-ru"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    <Icon name="MessageSquare" size={20} />
                    Открыть MAX.ru
                  </a>
                  <a
                    href="https://chat.ai-ru.ru"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    <Icon name="Bot" size={20} />
                    Чат-бот AI-ру
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};