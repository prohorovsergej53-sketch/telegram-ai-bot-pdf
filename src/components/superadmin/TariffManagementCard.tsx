import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { authenticatedFetch } from '@/lib/auth';
import { BACKEND_URLS } from '@/components/hotel/types';

interface Tariff {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  renewal_price: number;
  setup_fee: number;
}

const TariffManagementCard = () => {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTariffs();
  }, []);

  const loadTariffs = async () => {
    try {
      setIsLoading(true);
      const response = await authenticatedFetch(BACKEND_URLS.tariffManagement);
      const data = await response.json();
      if (data.tariffs) {
        setTariffs(data.tariffs);
      }
    } catch (error) {
      console.error('Error loading tariffs:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить тарифы',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (tariff: Tariff) => {
    setEditingTariff({ ...tariff });
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    if (!editingTariff) return;

    try {
      const response = await authenticatedFetch(BACKEND_URLS.tariffManagement, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTariff)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Сохранено!',
          description: `Тариф "${editingTariff.name}" обновлён`
        });
        setShowEditDialog(false);
        loadTariffs();
      } else {
        throw new Error(data.error || 'Ошибка сохранения');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const updateEditingField = (field: keyof Tariff, value: any) => {
    if (!editingTariff) return;
    setEditingTariff({ ...editingTariff, [field]: value });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Icon name="Loader2" className="animate-spin" size={24} />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-xl">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Settings" size={20} />
            Управление тарифами
          </CardTitle>
          <CardDescription>Редактирование цен, лимитов и характеристик тарифов</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {tariffs.map((tariff) => (
              <div
                key={tariff.id}
                className="p-4 border rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{tariff.name}</h3>
                      {tariff.is_popular && (
                        <Badge className="bg-primary text-white">Популярный</Badge>
                      )}
                      {!tariff.is_active && (
                        <Badge variant="outline">Неактивен</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">ID: {tariff.id}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(tariff)}
                  >
                    <Icon name="Edit" size={16} className="mr-2" />
                    Редактировать
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-slate-500">Цена</p>
                    <p className="font-semibold">{tariff.price.toLocaleString('ru-RU')} ₽</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Продление</p>
                    <p className="font-semibold">{tariff.renewal_price.toLocaleString('ru-RU')} ₽</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Период</p>
                    <p className="font-semibold">{tariff.period}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Сортировка</p>
                    <p className="font-semibold">{tariff.sort_order}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-2">Возможности:</p>
                  <div className="flex flex-wrap gap-2">
                    {(tariff.features || []).slice(0, 3).map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {(tariff.features || []).length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{(tariff.features || []).length - 3} ещё
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {editingTariff && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Редактирование тарифа "{editingTariff.name}"</DialogTitle>
              <DialogDescription>
                Изменение параметров тарифа {editingTariff.id}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Название</Label>
                  <Input
                    id="name"
                    value={editingTariff.name}
                    onChange={(e) => updateEditingField('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="period">Период</Label>
                  <Input
                    id="period"
                    value={editingTariff.period}
                    onChange={(e) => updateEditingField('period', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Цена (₽)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={editingTariff.price}
                    onChange={(e) => updateEditingField('price', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="renewal_price">Продление (₽)</Label>
                  <Input
                    id="renewal_price"
                    type="number"
                    value={editingTariff.renewal_price}
                    onChange={(e) => updateEditingField('renewal_price', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="sort_order">Порядок</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={editingTariff.sort_order}
                    onChange={(e) => updateEditingField('sort_order', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTariff.is_popular}
                    onChange={(e) => updateEditingField('is_popular', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Популярный</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTariff.is_active}
                    onChange={(e) => updateEditingField('is_active', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Активен</span>
                </label>
              </div>

              <div>
                <Label>Возможности (по одной на строку)</Label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg min-h-[200px] font-mono text-sm"
                  value={editingTariff.features.join('\n')}
                  onChange={(e) => updateEditingField('features', e.target.value.split('\n').filter(f => f.trim()))}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить изменения
                </Button>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default TariffManagementCard;