import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export const HowItWorksSection = () => {
  const steps = [
    {
      number: '1',
      icon: 'UserPlus',
      title: 'Регистрация за 30 секунд',
      description: 'Оплачиваете тариф — система автоматически создаёт ваш личный кабинет. Вы сразу получаете доступ ко всем функциям.',
      time: '30 сек',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      number: '2',
      icon: 'Upload',
      title: 'Загрузка знаний',
      description: 'Загружаете PDF файлы: прайс-листы, описания услуг, инструкции, правила. AI анализирует и запоминает всю информацию.',
      time: '5-10 мин',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      number: '3',
      icon: 'Settings',
      title: 'Настройка бота',
      description: 'Пишете приветствие, выбираете стиль общения, настраиваете правила ответов. Простой интерфейс — как в мессенджере.',
      time: '5-10 мин',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      number: '4',
      icon: 'Link',
      title: 'Подключение каналов',
      description: 'Копируете ссылку на web-чат или виджет для сайта. На Бизнес/Премиум — подключаете Telegram, WhatsApp, VK по инструкции.',
      time: '2-5 мин',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      number: '5',
      icon: 'TestTube',
      title: 'Тестирование',
      description: 'Задаёте боту вопросы, проверяете ответы, корректируете, если нужно. Убеждаетесь, что всё работает идеально.',
      time: '10-15 мин',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      number: '6',
      icon: 'Rocket',
      title: 'Запуск!',
      description: 'AI-консультант готов принимать вопросы клиентов! Вы видите статистику в реальном времени и можете корректировать ответы.',
      time: 'Готово!',
      gradient: 'from-pink-500 to-rose-500'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg">
            <p className="text-sm font-bold text-white flex items-center gap-2">
              <Icon name="MapPin" size={18} />
              Простой путь от идеи до результата
            </p>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Как мы работаем
          </h2>
          <p className="text-2xl text-slate-700 max-w-4xl mx-auto font-medium">
            От оплаты до запуска — всего 30 минут. Без программистов, без сложных настроек.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-slate-200">
                <CardContent className="pt-8 relative">
                  <div className={`absolute top-4 right-4 w-12 h-12 bg-gradient-to-br ${step.gradient} rounded-full flex items-center justify-center`}>
                    <span className="text-2xl font-bold text-white">{step.number}</span>
                  </div>
                  
                  <div className={`w-20 h-20 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                    <Icon name={step.icon as any} size={40} className="text-white" />
                  </div>

                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <div className="inline-block px-3 py-1 bg-slate-100 rounded-full">
                      <p className="text-xs font-semibold text-slate-600">⏱️ {step.time}</p>
                    </div>
                  </div>

                  <p className="text-slate-700 leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 border-0 shadow-2xl">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon name="Trophy" size={40} className="text-white" />
                </div>
                <h3 className="text-4xl font-bold text-white mb-4">
                  Итого: От 30 минут до полного запуска
                </h3>
                <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                  На тарифе Премиум личный менеджер сделает всё за вас — вы получите готового AI-консультанта под ключ
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                    <div className="text-3xl font-bold text-white mb-2">30 мин</div>
                    <div className="text-green-100 text-sm">самостоятельная настройка</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                    <div className="text-3xl font-bold text-white mb-2">24 часа</div>
                    <div className="text-green-100 text-sm">настройка Премиум под ключ</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                    <div className="text-3xl font-bold text-white mb-2">0</div>
                    <div className="text-green-100 text-sm">технических знаний</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
