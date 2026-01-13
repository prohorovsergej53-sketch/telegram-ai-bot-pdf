import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const BACKEND_URL = 'https://functions.poehali.dev/2163d682-19a2-462b-b577-7f04219cc3c8';

interface Tariff {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

const TariffManagementPanel = () => {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTariffs();
  }, []);

  const loadTariffs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}?action=tariffs`);
      const data = await response.json();
      setTariffs(data.tariffs || []);
    } catch (error) {
      console.error('Error loading tariffs:', error);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить тарифы', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTariff = async (tariff: Tariff) => {
    try {
      const response = await fetch(`${BACKEND_URL}?action=tariffs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tariff)
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'Тариф сохранен' });
        setEditingTariff(null);
        loadTariffs();
      } else {
        throw new Error('Failed to save tariff');
      }
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon name="Loader2" className="animate-spin" size={24} />
      </div>
    );
  }

  if (editingTariff) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Редактирование тарифа</h2>
          <Button variant="outline" onClick={() => setEditingTariff(null)}>
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
                value={editingTariff.name}
                onChange={(e) => setEditingTariff({ ...editingTariff, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Цена (₽)</Label>
                <Input
                  id="price"
                  type="number"
                  value={editingTariff.price}
                  onChange={(e) => setEditingTariff({ ...editingTariff, price: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="period">Период</Label>
                <Input
                  id="period"
                  value={editingTariff.period}
                  onChange={(e) => setEditingTariff({ ...editingTariff, period: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Возможности тарифа</Label>
              <div className="space-y-2 mt-2">
                {editingTariff.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => setEditingTariff({
                        ...editingTariff,
                        features: updateFeature(editingTariff.features, index, e.target.value)
                      })}
                      placeholder="Описание возможности"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingTariff({
                        ...editingTariff,
                        features: removeFeature(editingTariff.features, index)
                      })}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setEditingTariff({
                    ...editingTariff,
                    features: addFeature(editingTariff.features)
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
                checked={editingTariff.is_popular}
                onCheckedChange={(checked) => setEditingTariff({ ...editingTariff, is_popular: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Активен</Label>
              <Switch
                id="is_active"
                checked={editingTariff.is_active}
                onCheckedChange={(checked) => setEditingTariff({ ...editingTariff, is_active: checked })}
              />
            </div>

            <Button className="w-full" onClick={() => handleSaveTariff(editingTariff)}>
              <Icon name="Save" className="mr-2" size={16} />
              Сохранить тариф
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Управление тарифами</h2>
        <p className="text-muted-foreground">
          Настройка тарифных планов для подписки
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {tariffs.map((tariff) => (
          <Card key={tariff.id} className={!tariff.is_active ? 'opacity-50' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{tariff.name}</CardTitle>
                {tariff.is_popular && (
                  <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                    Популярный
                  </span>
                )}
              </div>
              <CardDescription>
                <span className="text-2xl font-bold">{tariff.price.toLocaleString('ru-RU')} ₽</span>
                <span className="text-sm"> / {tariff.period}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {tariff.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-green-600 mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setEditingTariff(tariff)}
              >
                <Icon name="Edit" className="mr-2" size={16} />
                Редактировать
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TariffManagementPanel;
