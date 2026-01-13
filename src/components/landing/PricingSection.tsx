import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface PricingSectionProps {
  onPlanSelect: (tariffId: string) => void;
}

export const PricingSection = ({ onPlanSelect }: PricingSectionProps) => {
  return (
    <div id="pricing" className="bg-slate-50 py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-bold text-center text-slate-900 mb-4">
          Выберите свой тариф
        </h2>
        <p className="text-xl text-slate-600 text-center mb-12 max-w-3xl mx-auto">
          Начните с маленького, растите без ограничений. Первый месяц — полная настройка, дальше — только поддержка
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="hover:shadow-xl transition-all hover:-translate-y-1">
            <CardContent className="pt-8">
              <div className="bg-blue-50 inline-block px-3 py-1 rounded-full mb-3">
                <span className="text-xs font-semibold text-primary">Лучшее для старта</span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-2">Старт</h3>
              <p className="text-slate-600 mb-4">Для малого бизнеса</p>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-slate-900">9 975</span>
                  <span className="text-2xl text-slate-600">₽</span>
                </div>
                <div className="text-sm text-slate-500">первый месяц с настройкой</div>
                <div className="text-lg font-semibold text-green-600 mt-1">дальше 1 975₽/мес</div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-slate-600">
                  <Icon name="Check" size={20} className="text-green-600" />
                  Web-чат на отдельной странице и на Ваш сайт
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
              <Button className="w-full" variant="outline" onClick={() => onPlanSelect('basic')}>
                Выбрать
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-blue-600 text-white px-6 py-2 text-sm font-bold">
              ⭐ САМЫЙ ПОПУЛЯРНЫЙ
            </div>
            <CardContent className="pt-12">
              <h3 className="text-3xl font-bold text-slate-900 mb-2">Бизнес</h3>
              <p className="text-slate-600 mb-4">Для растущих компаний</p>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">19 975</span>
                  <span className="text-2xl text-slate-600">₽</span>
                </div>
                <div className="text-sm text-slate-500">первый месяц с настройкой</div>
                <div className="text-lg font-semibold text-green-600 mt-1">дальше 4 975₽/мес</div>
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
              <Button className="w-full" onClick={() => onPlanSelect('professional')}>
                Выбрать
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-purple-300">
            <CardContent className="pt-8">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 inline-block px-3 py-1 rounded-full mb-3">
                <span className="text-xs font-semibold text-purple-700">Максимум возможностей</span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-2">Премиум</h3>
              <p className="text-slate-600 mb-4">Для крупного бизнеса</p>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-slate-900">49 975</span>
                  <span className="text-2xl text-slate-600">₽</span>
                </div>
                <div className="text-sm text-slate-500">первый месяц с настройкой</div>
                <div className="text-lg font-semibold text-green-600 mt-1">дальше 14 975₽/мес</div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-slate-600">
                  <Icon name="Check" size={20} className="text-green-600" />
                  Всё из тарифа Бизнес
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <Icon name="Check" size={20} className="text-green-600" />
                  VK, MAX (ваши ключи + инструкция)
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <Icon name="Check" size={20} className="text-green-600" />
                  Ваш API ключ YandexGPT (даём инструкцию)
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
              <Button className="w-full" variant="outline" onClick={() => onPlanSelect('enterprise')}>
                Выбрать
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};