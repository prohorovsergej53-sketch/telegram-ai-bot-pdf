import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Tariff } from './types';

interface TariffsTabProps {
  tariffs: Tariff[];
  onEditTariff: (tariff: Tariff) => void;
}

export const TariffsTab = ({ tariffs, onEditTariff }: TariffsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление тарифами</CardTitle>
        <CardDescription>Редактирование цен, лимитов и характеристик тарифов</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tariffs.map(tariff => (
            <div key={tariff.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{tariff.name}</h3>
                  {tariff.is_active ? (
                    <Badge variant="default">Активен</Badge>
                  ) : (
                    <Badge variant="secondary">Неактивен</Badge>
                  )}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Подключение:</span> {(tariff.setup_fee || 0).toLocaleString('ru-RU')} ₽
                  </div>
                  <div>
                    <span className="font-medium">Первоначальная оплата:</span> {tariff.price.toLocaleString('ru-RU')} ₽ / {tariff.period}
                  </div>
                  <div>
                    <span className="font-medium">Продление:</span> {(tariff.renewal_price || 0).toLocaleString('ru-RU')} ₽/мес
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEditTariff(tariff)}
              >
                <Icon name="Edit" size={16} className="mr-2" />
                Редактировать
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};