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
    <div id="order-form" className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-2xl">
          <CardContent className="pt-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">
              Заказать AI-консультанта
            </h2>
            <p className="text-slate-600 mb-8 text-center">
              Заполните форму и перейдите к оплате
            </p>
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
              <Button type="submit" size="lg" className="w-full text-lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                    Переход к оплате...
                  </>
                ) : (
                  <>
                    <Icon name="CreditCard" className="mr-2" size={20} />
                    Перейти к оплате {tariffs[formData.tariff as keyof typeof tariffs].price.toLocaleString('ru-RU')} ₽
                  </>
                )}
              </Button>
              <p className="text-xs text-slate-500 text-center">
                Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};