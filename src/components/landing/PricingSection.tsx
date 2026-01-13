import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface PricingSectionProps {
  onPlanSelect: () => void;
}

export const PricingSection = ({ onPlanSelect }: PricingSectionProps) => {
  return (
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
                <div>
                  <span className="text-4xl font-bold text-slate-900">9 975₽</span>
                  <span className="text-slate-600">/мес</span>
                </div>
                <div className="text-sm text-slate-500 mt-1">продление 2 000₽/мес</div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-slate-600">
                  <Icon name="Check" size={20} className="text-green-600" />
                  Публичный web-чат
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <Icon name="Check" size={20} className="text-green-600" />
                  До 10 PDF документов
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <Icon name="Check" size={20} className="text-green-600" />
                  Ваш API ключ YandexGPT
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <Icon name="Check" size={20} className="text-green-600" />
                  Базовые настройки
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  <Icon name="X" size={20} className="text-slate-400" />
                  Без мессенджеров
                </li>
              </ul>
              <Button className="w-full" variant="outline" onClick={onPlanSelect}>
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
                <div>
                  <span className="text-4xl font-bold text-slate-900">19 990₽</span>
                  <span className="text-slate-600">/мес</span>
                </div>
                <div className="text-sm text-slate-500 mt-1">продление 5 000₽/мес</div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-slate-600">
                  <Icon name="Check" size={20} className="text-green-600" />
                  Всё из тарифа Старт
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <Icon name="Check" size={20} className="text-green-600" />
                  Telegram интеграция
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <Icon name="Check" size={20} className="text-green-600" />
                  До 25 PDF документов
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <Icon name="Check" size={20} className="text-green-600" />
                  Ваш API ключ YandexGPT
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <Icon name="Check" size={20} className="text-green-600" />
                  Приоритетная поддержка
                </li>
              </ul>
              <Button className="w-full" onClick={onPlanSelect}>
                Выбрать
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardContent className="pt-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Премиум</h3>
              <p className="text-slate-600 mb-4">Для крупного бизнеса</p>
              <div className="mb-6">
                <div>
                  <span className="text-4xl font-bold text-slate-900">49 990₽</span>
                  <span className="text-slate-600">/мес</span>
                </div>
                <div className="text-sm text-slate-500 mt-1">продление 15 000₽/мес</div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-slate-600">
                  <Icon name="Check" size={20} className="text-green-600" />
                  Всё из тарифа Бизнес
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <Icon name="Check" size={20} className="text-green-600" />
                  WhatsApp, VK, MAX (по вашим ключам)
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <Icon name="Check" size={20} className="text-green-600" />
                  До 100 PDF документов
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <Icon name="Check" size={20} className="text-green-600" />
                  Настройка нашими специалистами
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <Icon name="Check" size={20} className="text-green-600" />
                  Личный менеджер проекта
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <Icon name="Check" size={20} className="text-green-600" />
                  Кастомизация под задачи
                </li>
              </ul>
              <Button className="w-full" variant="outline" onClick={onPlanSelect}>
                Связаться
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};