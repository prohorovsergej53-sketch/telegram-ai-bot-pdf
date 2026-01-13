import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const YOOKASSA_CREATE_PAYMENT_URL = 'https://functions.poehali.dev/f4c127b8-2009-4d9b-b026-9fdf933b8b3a';

interface OrderFormSectionProps {
  selectedTariff?: string;
}

export const OrderFormSection = ({ selectedTariff }: OrderFormSectionProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    tariff: selectedTariff || 'basic',
    comment: ''
  });

  useEffect(() => {
    if (selectedTariff) {
      setFormData(prev => ({ ...prev, tariff: selectedTariff }));
    }
  }, [selectedTariff]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const tariffs = {
    basic: { name: 'Старт', price: 9975, description: 'Старт (9 975₽/мес)', renewal: 1975 },
    professional: { name: 'Бизнес', price: 19975, description: 'Бизнес (19 975₽/мес)', renewal: 4975 },
    enterprise: { name: 'Премиум', price: 49975, description: 'Премиум (49 975₽/мес)', renewal: 14975 }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.phone) {
      setError('Заполните email и телефон');
      return;
    }

    setIsLoading(true);

    try {
      const selectedTariff = tariffs[formData.tariff as keyof typeof tariffs];
      const tenantSlug = formData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

      const response = await fetch(YOOKASSA_CREATE_PAYMENT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedTariff.price,
          description: `Подписка ${selectedTariff.name} - ${formData.name || formData.email}`,
          return_url: `${window.location.origin}/payment/success`,
          metadata: {
            tenant_name: formData.name || formData.email.split('@')[0],
            tenant_slug: tenantSlug,
            owner_email: formData.email,
            owner_phone: formData.phone,
            tariff_id: formData.tariff,
            comment: formData.comment
          }
        })
      });

      const data = await response.json();

      if (response.ok && data.confirmation_url) {
        window.location.href = data.confirmation_url;
      } else {
        throw new Error(data.error || 'Не удалось создать платёж');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="order-form" className="bg-gradient-to-b from-white to-slate-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
              <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
                <Icon name="Zap" size={16} />
                Запуск за 24 часа после оплаты
              </p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Начните увеличивать продажи уже завтра
            </h2>
            <p className="text-xl text-slate-600">
              Заполните форму → Оплатите → Получите AI-консультанта
            </p>
          </div>
          <Card className="shadow-2xl border-2 border-primary/20">
            <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ваше имя (необязательно)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Иван Иванов"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="ivan@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Телефон *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+7 999 123-45-67"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Тариф
                </label>
                <select 
                  value={formData.tariff}
                  onChange={(e) => setFormData({ ...formData, tariff: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="basic">{tariffs.basic.description} + продление 1975₽/мес</option>
                  <option value="professional">{tariffs.professional.description} + продление 4975₽/мес</option>
                  <option value="enterprise">{tariffs.enterprise.description} + продление 14975₽/мес</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Комментарий (опционально)
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px]"
                  placeholder="Расскажите о вашем проекте..."
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  {error}
                </div>
              )}
              {formData.tariff === 'enterprise' ? (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-6 mb-6 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon name="Crown" size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
                        Тариф Премиум — делаем всё за вас
                        <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">VIP</span>
                      </h3>
                      <ul className="space-y-2.5 text-sm text-slate-700">
                        <li className="flex items-start gap-2">
                          <Icon name="Check" size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong>Шаг 1:</strong> Оплатите тариф Премиум прямо сейчас</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="Check" size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong>Шаг 2:</strong> Система автоматически создаст ваш аккаунт за 30 секунд</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="Check" size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong>Шаг 3:</strong> Личный менеджер свяжется с вами в течение 2 часов</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="Check" size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong>Шаг 4:</strong> Настроим всё под ключ: загрузим документы, подключим все мессенджеры</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="Check" size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong>Готово!</strong> Получите работающего AI-консультанта с полной поддержкой</span>
                        </li>
                      </ul>
                      <div className="mt-4 p-3 bg-white/60 rounded-lg">
                        <p className="text-xs text-purple-900 font-semibold flex items-center gap-2">
                          <Icon name="Sparkles" size={16} />
                          Вам не нужно ничего делать — мы всё настроим сами!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-6 mb-6 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon name="Zap" size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                        {formData.tariff === 'basic' ? 'Тариф Старт' : 'Тариф Бизнес'} — запуск за 5 минут
                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Самостоятельно</span>
                      </h3>
                      <ul className="space-y-2.5 text-sm text-slate-700">
                        <li className="flex items-start gap-2">
                          <Icon name="Check" size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong>Шаг 1:</strong> Оплатите выбранный тариф прямо сейчас</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="Check" size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong>Шаг 2:</strong> Система автоматически создаст ваш аккаунт за 30 секунд</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="Check" size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong>Шаг 3:</strong> Вы сразу получите доступ в личный кабинет</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="Check" size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong>Шаг 4:</strong> Загрузите PDF документы и настройте бота за 5 минут</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="Check" size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong>Готово!</strong> Начните принимать вопросы клиентов уже сегодня</span>
                        </li>
                      </ul>
                      <div className="mt-4 p-3 bg-white/60 rounded-lg">
                        <p className="text-xs text-blue-900 font-semibold flex items-center gap-2">
                          <Icon name="Info" size={16} />
                          Простой интерфейс — настроите сами без технических знаний!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <Button type="submit" size="lg" className="w-full text-xl py-7 shadow-xl" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 animate-spin" size={24} />
                    Переход к оплате...
                  </>
                ) : (
                  <>
                    <Icon name="Rocket" className="mr-2" size={24} />
                    Запустить за {tariffs[formData.tariff as keyof typeof tariffs].price.toLocaleString('ru-RU')} ₽
                  </>
                )}
              </Button>
              <div className="flex items-center justify-center gap-6 text-sm text-slate-600 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Icon name="ShieldCheck" size={16} className="text-green-600" />
                  <span>Защищённый платёж</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Lock" size={16} className="text-green-600" />
                  <span>Соответствие 152-ФЗ</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center">
                Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных
              </p>
            </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};