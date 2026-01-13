import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { TariffEditForm } from './TariffEditForm';
import { TariffCard } from './TariffCard';

const BACKEND_URL = 'https://functions.poehali.dev/2163d682-19a2-462b-b577-7f04219cc3c8';

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon name="Loader2" className="animate-spin" size={24} />
      </div>
    );
  }

  if (editingTariff) {
    return (
      <TariffEditForm
        tariff={editingTariff}
        onSave={handleSaveTariff}
        onCancel={() => setEditingTariff(null)}
        onChange={setEditingTariff}
      />
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
          <TariffCard
            key={tariff.id}
            tariff={tariff}
            onEdit={setEditingTariff}
          />
        ))}
      </div>
    </div>
  );
};

export default TariffManagementPanel;
