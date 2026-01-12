import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const LandingPage = () => {
  const scrollToForm = () => {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            AI-консьерж для вашего бизнеса
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Умный чат-бот, который знает всё о вашей компании и отвечает на вопросы клиентов 24/7
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={scrollToForm} className="text-lg px-8">
              Заказать чат-бота
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Посмотреть демо
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
          Почему AI-консьерж?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover:shadow-xl transition-shadow">
            <CardContent className="pt-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="MessageCircle" size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Работает 24/7
              </h3>
              <p className="text-slate-600">
                Отвечает на вопросы клиентов в любое время суток без выходных и праздников
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardContent className="pt-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Brain" size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Знает ваш бизнес
              </h3>
              <p className="text-slate-600">
                Обучен на ваших документах: прайсах, правилах, описаниях услуг
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardContent className="pt-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Zap" size={32} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Быстрая интеграция
              </h3>
              <p className="text-slate-600">
                Готов к работе за 1 день. Встраивается на любой сайт одной строкой кода
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardContent className="pt-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Shield" size={32} className="text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Безопасность данных
              </h3>
              <p className="text-slate-600">
                Все данные хранятся в России, соответствие 152-ФЗ
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardContent className="pt-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Settings" size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Гибкая настройка
              </h3>
              <p className="text-slate-600">
                Настройте тон общения, дизайн виджета и правила ответов под себя
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardContent className="pt-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="BarChart" size={32} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Аналитика
              </h3>
              <p className="text-slate-600">
                Статистика вопросов, качество ответов, популярные темы
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Тарифы
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="pt-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Старт</h3>
                <p className="text-slate-600 mb-4">Для небольших проектов</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">9 990₽</span>
                  <span className="text-slate-600">/мес</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-slate-600">
                    <Icon name="Check" size={20} className="text-green-600" />
                    До 1000 сообщений
                  </li>
                  <li className="flex items-center gap-2 text-slate-600">
                    <Icon name="Check" size={20} className="text-green-600" />
                    До 10 документов
                  </li>
                  <li className="flex items-center gap-2 text-slate-600">
                    <Icon name="Check" size={20} className="text-green-600" />
                    Базовая аналитика
                  </li>
                  <li className="flex items-center gap-2 text-slate-600">
                    <Icon name="Check" size={20} className="text-green-600" />
                    Виджет для сайта
                  </li>
                </ul>
                <Button className="w-full" variant="outline" onClick={scrollToForm}>
                  Выбрать
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow border-2 border-primary">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-slate-900">Бизнес</h3>
                  <span className="text-xs px-2 py-1 bg-primary text-white rounded">
                    Популярный
                  </span>
                </div>
                <p className="text-slate-600 mb-4">Для растущих компаний</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">24 990₽</span>
                  <span className="text-slate-600">/мес</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-slate-600">
                    <Icon name="Check" size={20} className="text-green-600" />
                    До 10 000 сообщений
                  </li>
                  <li className="flex items-center gap-2 text-slate-600">
                    <Icon name="Check" size={20} className="text-green-600" />
                    Неограниченно документов
                  </li>
                  <li className="flex items-center gap-2 text-slate-600">
                    <Icon name="Check" size={20} className="text-green-600" />
                    Полная аналитика
                  </li>
                  <li className="flex items-center gap-2 text-slate-600">
                    <Icon name="Check" size={20} className="text-green-600" />
                    Telegram интеграция
                  </li>
                  <li className="flex items-center gap-2 text-slate-600">
                    <Icon name="Check" size={20} className="text-green-600" />
                    Приоритетная поддержка
                  </li>
                </ul>
                <Button className="w-full" onClick={scrollToForm}>
                  Выбрать
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="pt-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Корпоративный</h3>
                <p className="text-slate-600 mb-4">Для крупного бизнеса</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">от 49 990₽</span>
                  <span className="text-slate-600">/мес</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-slate-600">
                    <Icon name="Check" size={20} className="text-green-600" />
                    Безлимитные сообщения
                  </li>
                  <li className="flex items-center gap-2 text-slate-600">
                    <Icon name="Check" size={20} className="text-green-600" />
                    Мультиязычность
                  </li>
                  <li className="flex items-center gap-2 text-slate-600">
                    <Icon name="Check" size={20} className="text-green-600" />
                    API доступ
                  </li>
                  <li className="flex items-center gap-2 text-slate-600">
                    <Icon name="Check" size={20} className="text-green-600" />
                    Выделенный сервер
                  </li>
                  <li className="flex items-center gap-2 text-slate-600">
                    <Icon name="Check" size={20} className="text-green-600" />
                    Персональный менеджер
                  </li>
                </ul>
                <Button className="w-full" variant="outline" onClick={scrollToForm}>
                  Связаться
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div id="order-form" className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl">
            <CardContent className="pt-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">
                Заказать AI-консьержа
              </h2>
              <p className="text-slate-600 mb-8 text-center">
                Оставьте заявку и мы свяжемся с вами в течение часа
              </p>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ваше имя
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Иван Иванов"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="ivan@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+7 999 123-45-67"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Тариф
                  </label>
                  <select className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option>Старт (9 990₽/мес)</option>
                    <option>Бизнес (24 990₽/мес)</option>
                    <option>Корпоративный (от 49 990₽/мес)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Комментарий (опционально)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px]"
                    placeholder="Расскажите о вашем проекте..."
                  />
                </div>
                <Button type="submit" size="lg" className="w-full text-lg">
                  Отправить заявку
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400 mb-4">
            © 2026 AI-консьерж. Все права защищены.
          </p>
          <div className="flex gap-6 justify-center text-slate-400">
            <a href="#" className="hover:text-white transition-colors">
              Политика конфиденциальности
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Публичная оферта
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Контакты
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
