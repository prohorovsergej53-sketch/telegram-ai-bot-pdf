import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export const FeaturesSection = () => {
  const problems = [
    {
      icon: 'X',
      title: 'Клиенты уходят',
      description: 'Потому что ждут ответа по 8 часов',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      icon: 'X',
      title: 'Звонки по ночам',
      description: 'Сотрудники выгорают, а клиенты недовольны',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      icon: 'X',
      title: 'Одни вопросы',
      description: '90% вопросов одинаковые, но тратите время',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  const features = [
    {
      icon: 'Zap',
      title: 'Ответ за 3 секунды',
      description: 'И клиент не уходит к конкурентам. Захватывает внимание сразу',
      bgColor: 'bg-blue-100',
      iconColor: 'text-primary',
      value: '247%',
      valueLabel: 'рост конверсии'
    },
    {
      icon: 'Clock',
      title: 'Работает 24/7/365',
      description: 'Даже в 3 ночи, в выходные, в праздники. Никогда не устаёт, не заболеет, не уйдёт в отпуск',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      value: '0₽',
      valueLabel: 'зарплата'
    },
    {
      icon: 'Brain',
      title: 'Знает ВСЁ о вас',
      description: 'Загружаете прайсы, инструкции, правила — и он становится экспертом',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      value: '97%',
      valueLabel: 'точность'
    },
    {
      icon: 'MessageSquare',
      title: 'Все мессенджеры',
      description: 'Telegram, WhatsApp, VK, сайт — отвечает в любом канале. Один бот — всюду',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      value: '4',
      valueLabel: 'канала'
    },
    {
      icon: 'Shield',
      title: 'Безопасность 152-ФЗ',
      description: 'Данные хранятся в России. Полное соответствие законодательству РФ',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      value: '100%',
      valueLabel: 'защита'
    },
    {
      icon: 'Rocket',
      title: 'Запуск за 1 день',
      description: 'Не нужно нанимать программистов. Загружаете документы — и бот готов работать',
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      value: '24ч',
      valueLabel: 'до запуска'
    }
  ];

  return (
    <>
      <div className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-4">
            Знакомая ситуация?
          </h2>
          <p className="text-xl text-slate-600 text-center mb-12 max-w-3xl mx-auto">
            Каждый день вы теряете клиентов и деньги из-за того, что...
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {problems.map((problem, index) => (
              <div key={index} className={`${problem.bgColor} border-2 border-red-200 rounded-xl p-6 text-center`}>
                <Icon name={problem.icon as any} size={48} className={`${problem.color} mx-auto mb-3`} />
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {problem.title}
                </h3>
                <p className="text-slate-700">
                  {problem.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-5xl font-bold text-center text-slate-900 mb-4">
          Решение готово
        </h2>
        <p className="text-xl text-slate-600 text-center mb-16 max-w-3xl mx-auto">
          AI-консультант решает эти проблемы за 1 день
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-2xl transition-all hover:-translate-y-1">
              <CardContent className="pt-8">
                <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-4`}>
                  <Icon name={feature.icon as any} size={32} className={feature.iconColor} />
                </div>
                <div className="mb-3">
                  <div className="text-3xl font-bold text-primary">{feature.value}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">{feature.valueLabel}</div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};