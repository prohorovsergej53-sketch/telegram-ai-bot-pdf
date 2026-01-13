import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

interface Tariff {
  id: string;
  name: string;
  price: number;
  renewal_price: number;
  setup_fee: number;
  period: string;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

interface TariffEditFormProps {
  tariff: Tariff;
  onSave: (tariff: Tariff) => void;
  onCancel: () => void;
  onChange: (tariff: Tariff) => void;
}

export const TariffEditForm = ({
  tariff,
  onSave,
  onCancel,
  onChange
}: TariffEditFormProps) => {
  const updateFeature = (features: string[], index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    return newFeatures;
  };

  const addFeature = (features: string[]) => {
    return [...features, ''];
  };

  const removeFeature = (features: string[], index: number) => {
    return features.filter((_, i) => i !== index);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Редактирование тарифа</h2>
        <Button variant="outline" onClick={onCancel}>
          <Icon name="X" className="mr-2" size={16} />
          Отмена
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor="name">Название тарифа</Label>
            <Input
              id="name"
              value={tariff.name}
              onChange={(e) => onChange({ ...tariff, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Начальная цена (₽)</Label>
              <Input
                id="price"
                type="number"
                value={tariff.price}
                onChange={(e) => onChange({ ...tariff, price: parseFloat(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Включает setup fee + первый период
              </p>
            </div>
            <div>
              <Label htmlFor="period">Период</Label>
              <Input
                id="period"
                value={tariff.period}
                onChange={(e) => onChange({ ...tariff, period: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="renewal_price">Цена продления (₽/мес)</Label>
              <Input
                id="renewal_price"
                type="number"
                value={tariff.renewal_price}
                onChange={(e) => onChange({ ...tariff, renewal_price: parseFloat(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ежемесячный платеж после первого
              </p>
            </div>
            <div>
              <Label htmlFor="setup_fee">Setup Fee (₽)</Label>
              <Input
                id="setup_fee"
                type="number"
                value={tariff.setup_fee}
                onChange={(e) => onChange({ ...tariff, setup_fee: parseFloat(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Единоразовая плата за создание
              </p>
            </div>
          </div>

          <div>
            <Label>Возможности тарифа</Label>
            <div className="space-y-2 mt-2">
              {tariff.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => onChange({
                      ...tariff,
                      features: updateFeature(tariff.features, index, e.target.value)
                    })}
                    placeholder="Описание возможности"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onChange({
                      ...tariff,
                      features: removeFeature(tariff.features, index)
                    })}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => onChange({
                  ...tariff,
                  features: addFeature(tariff.features)
                })}
              >
                <Icon name="Plus" className="mr-2" size={16} />
                Добавить возможность
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_popular">Популярный тариф</Label>
            <Switch
              id="is_popular"
              checked={tariff.is_popular}
              onCheckedChange={(checked) => onChange({ ...tariff, is_popular: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Активен</Label>
            <Switch
              id="is_active"
              checked={tariff.is_active}
              onCheckedChange={(checked) => onChange({ ...tariff, is_active: checked })}
            />
          </div>

          <Button className="w-full" onClick={() => onSave(tariff)}>
            <Icon name="Save" className="mr-2" size={16} />
            Сохранить тариф
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
