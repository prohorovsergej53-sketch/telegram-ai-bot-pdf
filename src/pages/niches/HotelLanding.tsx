import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Helmet } from 'react-helmet-async';
import { useState } from 'react';

const HotelLanding = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const benefits = [
    {
      icon: 'Clock',
      title: 'Работает 24/7/365',
      description: 'Ваш AI-консьерж отвечает гостям круглосуточно, даже когда администратор спит или занят',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: 'Zap',
      title: 'Мгновенные ответы',
      description: 'Никаких ожиданий! Гости получают информацию о номерах, ценах и услугах за секунды',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: 'Users',
      title: 'Обработка 1000+ диалогов',
      description: 'Одновременная работа с неограниченным количеством гостей без потери качества',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: 'TrendingUp',
      title: 'Рост конверсии в бронирования',
      description: 'Быстрые ответы = довольные гости = больше броней. Проверено практикой',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: 'MessageCircle',
      title: 'Все мессенджеры в одном месте',
      description: 'Telegram, VK, MAX и веб-чат на сайте — управляйте всем из единой панели',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: 'Settings',
      title: 'Настройка за 15 минут',
      description: 'Загрузите прайс-лист и правила — готово! Бот уже отвечает на вопросы гостей',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const painPoints = [
    {
      icon: 'Phone',
      problem: 'Администратор не успевает отвечать на звонки',
      solution: 'AI-консьерж разгрузит персонал, отвечая на 80% типовых вопросов'
    },
    {
      icon: 'Moon',
      problem: 'Теряете броски ночью и в выходные',
      solution: 'Бот работает круглосуточно — вы не пропустите ни одного потенциального гостя'
    },
    {
      icon: 'DollarSign',
      problem: 'Нанимать дополнительный персонал дорого',
      solution: 'Один AI-консьерж заменяет 2-3 администраторов за ~1000₽/мес'
    },
    {
      icon: 'MessageSquare',
      problem: 'Гости задают одни и те же вопросы',
      solution: 'Бот мгновенно отвечает на FAQ, освобождая время для важных задач'
    }
  ];

  const useCases = [
    {
      title: 'Информация о номерах',
      description: 'Бот расскажет о типах номеров, удобствах, ценах и покажет фотографии',
      icon: 'Home'
    },
    {
      title: 'Прайс-лист и тарифы',
      description: 'Актуальные цены на проживание, сезонные скидки и спецпредложения',
      icon: 'Receipt'
    },
    {
      title: 'Услуги и инфраструктура',
      description: 'Бассейн, парковка, завтрак, трансфер — вся информация всегда под рукой',
      icon: 'Briefcase'
    },
    {
      title: 'Условия бронирования',
      description: 'Правила заезда/выезда, политика отмены, требования к оплате',
      icon: 'FileCheck'
    },
    {
      title: 'Расположение и как добраться',
      description: 'Адрес, координаты, маршруты от аэропорта, вокзала или на машине',
      icon: 'MapPin'
    },
    {
      title: 'Достопримечательности рядом',
      description: 'Что посмотреть в округе, пляжи, рестораны, экскурсии',
      icon: 'Compass'
    }
  ];

  const messengers = [
    {
      name: 'Telegram',
      icon: 'Send',
      color: 'bg-[#0088cc]',
      description: '80% гостей уже используют'
    },
    {
      name: 'MAX',
      icon: 'Shield',
      color: 'bg-purple-600',
      description: 'Российский защищённый'
    },
    {
      name: 'VK',
      icon: 'MessageCircle',
      color: 'bg-blue-600',
      description: '90+ млн пользователей'
    },
    {
      name: 'Веб-чат',
      icon: 'Globe',
      color: 'bg-green-600',
      description: 'Прямо на вашем сайте'
    }
  ];

  return (
    <>
      <Helmet>
        <title>AI-консьерж для отеля | Автоматизация работы с гостями 24/7</title>
        <meta name="description" content="AI-консьерж для вашего отеля: отвечает на вопросы гостей 24/7, увеличивает бронирования, разгружает администраторов. Работает в Telegram, VK, MAX и на сайте. Готовое решение от 1000₽/мес." />
        <meta property="og:title" content="AI-консьерж для отеля | Автоматизация работы с гостями" />
        <meta property="og:description" content="Умный помощник для вашего отеля: круглосуточные ответы гостям, рост конверсии, экономия на персонале. Попробуйте на примере отеля Династия!" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 opacity-95" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6">
                <Icon name="Sparkles" size={16} />
                <span>Готовое решение для гостиничного бизнеса</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                AI-консьерж для вашего отеля
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-4 max-w-3xl mx-auto">
                Умный помощник, который отвечает гостям 24/7, увеличивает бронирования и освобождает ваших администраторов для важных задач
              </p>
              
              <p className="text-lg text-blue-200 mb-10 max-w-2xl mx-auto">
                Работает в Telegram, VK, MAX и на вашем сайте. Настройка за 15 минут. От <span className="font-bold text-white">1000₽/месяц</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-2xl text-lg px-8 py-6 h-auto group"
                  onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Icon name="Play" size={20} className="mr-2 group-hover:scale-110 transition-transform" />
                  Посмотреть демо
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 text-lg px-8 py-6 h-auto"
                  onClick={() => window.open('https://t.me/your_support_bot', '_blank')}
                >
                  <Icon name="MessageCircle" size={20} className="mr-2" />
                  Получить консультацию
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-8 text-white/90 text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-green-300" />
                  <span>Запуск за 15 минут</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-green-300" />
                  <span>Без программирования</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-green-300" />
                  <span>Первые 7 дней бесплатно</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pain Points */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                Знакомые проблемы?
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Каждая из них стоит вам денег и упущенных броней
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {painPoints.map((item, idx) => (
                <Card key={idx} className="border-2 border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon name={item.icon} size={24} className="text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                          {item.problem}
                        </h3>
                        <div className="flex items-start gap-2 bg-green-50 rounded-lg p-3">
                          <Icon name="CheckCircle2" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-green-900 font-medium">
                            {item.solution}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                Почему отели выбирают AI-консьержа
              </h2>
              <p className="text-xl text-slate-600">
                6 причин внедрить прямо сейчас
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, idx) => (
                <Card key={idx} className="border-2 border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all group">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 bg-gradient-to-br ${benefit.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon name={benefit.icon} size={28} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-slate-600">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Icon name="Star" size={16} />
                <span>Живой пример</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                Протестируйте на примере<br />отеля «Династия» (Крым)
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Реальный AI-консьерж, который отвечает на вопросы гостей прямо сейчас
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {messengers.map((messenger, idx) => (
                <a
                  key={idx}
                  href={
                    messenger.name === 'Telegram' ? 'https://t.me/dynastiya_bot' :
                    messenger.name === 'MAX' ? 'https://max.ru/id9108121649_bot' :
                    messenger.name === 'VK' ? '#' :
                    '/dinasty-crimea/chat'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <Card className="border-2 border-slate-100 hover:border-blue-300 hover:shadow-xl transition-all h-full">
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 ${messenger.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon name={messenger.icon} size={32} className="text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {messenger.name}
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        {messenger.description}
                      </p>
                      <Button variant="outline" size="sm" className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600">
                        Попробовать
                        <Icon name="ArrowRight" size={16} className="ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>

            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Icon name="Lightbulb" size={24} className="text-blue-600" />
                  <h3 className="text-2xl font-bold text-slate-900">
                    Попробуйте задать эти вопросы:
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
                  {[
                    'Какие есть номера?',
                    'Сколько стоит проживание?',
                    'Есть ли парковка?',
                    'Как добраться из аэропорта?',
                    'Какие пляжи рядом?',
                    'Условия отмены брони?'
                  ].map((question, idx) => (
                    <div key={idx} className="bg-white rounded-lg px-4 py-3 text-slate-700 text-sm font-medium shadow-sm border border-slate-200">
                      "{question}"
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                На какие вопросы отвечает бот
              </h2>
              <p className="text-xl text-slate-600">
                80% типовых вопросов гостей — автоматически
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCases.map((useCase, idx) => (
                <Card key={idx} className="border-2 border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all group">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon name={useCase.icon} size={24} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {useCase.title}
                    </h3>
                    <p className="text-slate-600 text-sm">
                      {useCase.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                Как это работает
              </h2>
              <p className="text-xl text-slate-600">
                Запуск за 3 простых шага
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  title: 'Регистрация и загрузка данных',
                  description: 'Создайте аккаунт и загрузите прайс-лист, описание номеров, правила отеля — в любом формате (Word, PDF, текст)',
                  icon: 'Upload',
                  color: 'from-blue-500 to-blue-600'
                },
                {
                  step: '2',
                  title: 'Подключение мессенджеров',
                  description: 'Один клик — и ваш бот работает в Telegram, VK, MAX. Код для веб-чата на сайт тоже готов',
                  icon: 'Link',
                  color: 'from-purple-500 to-purple-600'
                },
                {
                  step: '3',
                  title: 'Готово! Бот отвечает гостям',
                  description: 'Следите за диалогами в панели управления, корректируйте ответы, анализируйте статистику',
                  icon: 'CheckCircle2',
                  color: 'from-green-500 to-green-600'
                }
              ].map((step, idx) => (
                <div key={idx} className="relative">
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-slate-200 to-slate-300 -z-10" />
                  )}
                  <Card className="border-2 border-slate-100 hover:shadow-2xl hover:border-blue-200 transition-all h-full">
                    <CardContent className="p-8 text-center">
                      <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl`}>
                        <div className="text-4xl font-bold text-white">{step.step}</div>
                      </div>
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Icon name={step.icon} size={24} className="text-slate-700" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-slate-600">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Прозрачные цены
              </h2>
              <p className="text-xl text-blue-200">
                Дешевле, чем один администратор на полставки
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  name: 'Старт',
                  price: '1 000',
                  period: 'месяц',
                  features: [
                    'Веб-чат на сайте',
                    'До 500 сообщений/мес',
                    'База знаний (до 10 документов)',
                    'Базовая статистика',
                    'Email поддержка'
                  ],
                  color: 'from-slate-600 to-slate-700',
                  popular: false
                },
                {
                  name: 'Бизнес',
                  price: '3 500',
                  period: 'месяц',
                  features: [
                    'Все из Старт',
                    'Telegram интеграция',
                    'До 2000 сообщений/мес',
                    'База знаний (до 50 документов)',
                    'Детальная статистика',
                    'Приоритетная поддержка'
                  ],
                  color: 'from-blue-600 to-purple-600',
                  popular: true
                },
                {
                  name: 'Премиум',
                  price: '8 000',
                  period: 'месяц',
                  features: [
                    'Все из Бизнес',
                    'VK и MAX интеграция',
                    'Безлимит сообщений',
                    'Неограниченная база знаний',
                    'Персональный менеджер',
                    'Кастомизация ответов AI',
                    'API доступ'
                  ],
                  color: 'from-purple-600 to-pink-600',
                  popular: false
                }
              ].map((plan, idx) => (
                <Card key={idx} className={`relative border-2 ${plan.popular ? 'border-yellow-400 shadow-2xl scale-105' : 'border-slate-700'} bg-white/5 backdrop-blur-sm hover:scale-110 transition-transform`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                        Популярный
                      </div>
                    </div>
                  )}
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-6">
                      <span className="text-5xl font-bold">{plan.price}</span>
                      <span className="text-xl text-blue-200">₽/{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <Icon name="Check" size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 hover:from-yellow-500 hover:to-orange-600' : 'bg-white/10 hover:bg-white/20'}`}
                      size="lg"
                      onClick={() => window.open('https://t.me/your_support_bot', '_blank')}
                    >
                      Начать работу
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-blue-200 mb-4">🎁 Первые 7 дней — бесплатно. Без привязки карты.</p>
              <p className="text-sm text-blue-300">Отмените в любой момент. Никаких скрытых платежей.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                Частые вопросы
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'Нужно ли уметь программировать?',
                  a: 'Нет! Настройка бота занимает 15 минут и не требует технических знаний. Просто загрузите документы и подключите мессенджеры через визуальный интерфейс.'
                },
                {
                  q: 'Можно ли обучить бота специфике моего отеля?',
                  a: 'Да! Загрузите ваши прайс-листы, правила, описания услуг — бот автоматически изучит информацию и будет отвечать с учётом ваших особенностей.'
                },
                {
                  q: 'Как бот интегрируется с системой бронирования?',
                  a: 'Бот предоставляет информацию и собирает заявки, которые вы видите в панели управления. Прямая интеграция с PMS — в тарифе Премиум.'
                },
                {
                  q: 'Что если бот не знает ответа на вопрос?',
                  a: 'Бот честно сообщит гостю, что нужна помощь человека, и уведомит вас в панели управления. Вы сможете ответить лично или дообучить бота.'
                },
                {
                  q: 'Можно ли отключить бота в любой момент?',
                  a: 'Да, вы управляете ботом полностью: можете приостановить, изменить настройки или отменить подписку без объяснений и штрафов.'
                },
                {
                  q: 'Безопасны ли данные наших гостей?',
                  a: 'Мы соблюдаем 152-ФЗ. Все данные шифруются, хранятся в России (Яндекс.Облако). Вы контролируете доступ и можете удалить информацию в любой момент.'
                }
              ].map((faq, idx) => (
                <Card key={idx} className="border-2 border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-start gap-2">
                      <Icon name="HelpCircle" size={20} className="text-blue-600 flex-shrink-0 mt-1" />
                      {faq.q}
                    </h3>
                    <p className="text-slate-600 ml-7">
                      {faq.a}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Готовы увеличить бронирования и разгрузить персонал?
              </h2>
              <p className="text-xl text-blue-100 mb-10">
                Запустите своего AI-консьержа за 15 минут. Первые 7 дней — бесплатно.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-2xl text-lg px-10 py-6 h-auto group"
                  onClick={() => window.open('/admin', '_blank')}
                >
                  <Icon name="Rocket" size={20} className="mr-2 group-hover:translate-x-1 transition-transform" />
                  Начать бесплатно
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 text-lg px-10 py-6 h-auto"
                  onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Icon name="Play" size={20} className="mr-2" />
                  Посмотреть демо
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Icon name="Bot" size={24} className="text-blue-400" />
                <span className="font-bold text-lg">AI-консьерж для отелей</span>
              </div>
              <div className="flex gap-6 text-sm text-slate-400">
                <a href="/privacy-policy" className="hover:text-white transition-colors">
                  Политика конфиденциальности
                </a>
                <a href="/terms-of-service" className="hover:text-white transition-colors">
                  Условия использования
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HotelLanding;
