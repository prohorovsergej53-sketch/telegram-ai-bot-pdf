import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Tariff, BACKEND_URLS } from './types';
import { useToast } from '@/hooks/use-toast';

interface TariffsTabProps {
  tariffs: Tariff[];
  onEditTariff: (tariff: Tariff) => void;
}

export const TariffsTab = ({ tariffs, onEditTariff }: TariffsTabProps) => {
  const [isMigrating, setIsMigrating] = useState(false);
  const { toast } = useToast();

  const handleMigrateSettings = async () => {
    setIsMigrating(true);
    try {
      const response = await fetch(BACKEND_URLS.migrateAiSettings, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: 'Синхронизация выполнена',
          description: data.message || `Обновлено настроек: ${data.updated_count}`,
        });
      } else {
        throw new Error(data.error || 'Ошибка синхронизации');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось выполнить синхронизацию',
        variant: 'destructive'
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Управление тарифами</CardTitle>
            <CardDescription>Редактирование цен, лимитов и характеристик тарифов</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleMigrateSettings}
            disabled={isMigrating}
          >
            <Icon name="RefreshCw" size={16} className="mr-2" />
            {isMigrating ? 'Синхронизация...' : 'Синхронизировать настройки AI'}
          </Button>
        </div>
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