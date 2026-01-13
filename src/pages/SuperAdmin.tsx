import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSuperAdmin, authenticatedFetch, enterTenantAsSuper } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tariff, Tenant, BACKEND_URLS } from '@/components/superadmin/types';
import { DashboardTab } from '@/components/superadmin/DashboardTab';
import { TenantsTab } from '@/components/superadmin/TenantsTab';
import { TariffsTab } from '@/components/superadmin/TariffsTab';
import { TenantEditDialog } from '@/components/superadmin/TenantEditDialog';
import { TariffEditDialog } from '@/components/superadmin/TariffEditDialog';

const SuperAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);

  useEffect(() => {
    if (!isSuperAdmin()) {
      navigate('/admin');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadTariffs(),
        loadTenants()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTariffs = async () => {
    try {
      const response = await authenticatedFetch(BACKEND_URLS.tariffs);
      if (response.ok) {
        const data = await response.json();
        setTariffs(data.tariffs || []);
      }
    } catch (error) {
      console.error('Error loading tariffs:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить тарифы',
        variant: 'destructive'
      });
    }
  };

  const loadTenants = async () => {
    try {
      const response = await authenticatedFetch(BACKEND_URLS.tenants);
      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants || []);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };

  const handleManageTenant = (tenant: Tenant) => {
    setEditingTenant(tenant);
  };

  const handleEnterTenantAdmin = (tenant: Tenant) => {
    enterTenantAsSuper(tenant.id, tenant.tariff_id);
    navigate(`/${tenant.slug}/admin`);
    toast({
      title: 'Вход в админку бота',
      description: `Вы вошли в админ-панель ${tenant.name} с полными правами`,
    });
  };

  const handleEditTariff = (tariff: Tariff) => {
    setEditingTariff(tariff);
  };

  const saveTenantChanges = async () => {
    if (!editingTenant) return;

    try {
      const response = await authenticatedFetch(BACKEND_URLS.tenants, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTenant.id,
          tariff_id: editingTenant.tariff_id,
          subscription_end_date: editingTenant.subscription_end_date
        })
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: `Клиент ${editingTenant.name} обновлён`,
        });
        setEditingTenant(null);
        loadTenants();
      } else {
        throw new Error('Failed to update tenant');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить клиента',
        variant: 'destructive'
      });
    }
  };

  const saveTariffChanges = async () => {
    if (!editingTariff) return;

    try {
      const response = await authenticatedFetch(BACKEND_URLS.tariffs, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTariff.id,
          name: editingTariff.name,
          price: editingTariff.price,
          period: editingTariff.period,
          is_active: editingTariff.is_active
        })
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: `Тариф ${editingTariff.name} обновлён`,
        });
        setEditingTariff(null);
        loadTariffs();
      } else {
        throw new Error('Failed to update tariff');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить тариф',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Мастер-панель управления
              </h1>
              <p className="text-slate-600">
                Полный контроль над платформой, клиентами и настройками
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              К своему боту
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="dashboard">
              <Icon name="LayoutDashboard" size={16} className="mr-2" />
              Дашборд
            </TabsTrigger>
            <TabsTrigger value="tenants">
              <Icon name="Users" size={16} className="mr-2" />
              Клиенты
            </TabsTrigger>
            <TabsTrigger value="tariffs">
              <Icon name="DollarSign" size={16} className="mr-2" />
              Тарифы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardTab tenants={tenants} tariffs={tariffs} />
          </TabsContent>

          <TabsContent value="tenants" className="space-y-6">
            <TenantsTab 
              tenants={tenants}
              onEnterTenant={handleEnterTenantAdmin}
              onManageTenant={handleManageTenant}
            />
          </TabsContent>

          <TabsContent value="tariffs" className="space-y-6">
            <TariffsTab 
              tariffs={tariffs}
              onEditTariff={handleEditTariff}
            />
          </TabsContent>
        </Tabs>
      </div>

      <TenantEditDialog
        tenant={editingTenant}
        tariffs={tariffs}
        onClose={() => setEditingTenant(null)}
        onSave={saveTenantChanges}
        onUpdate={setEditingTenant}
      />

      <TariffEditDialog
        tariff={editingTariff}
        onClose={() => setEditingTariff(null)}
        onSave={saveTariffChanges}
        onUpdate={setEditingTariff}
      />
    </div>
  );
};

export default SuperAdmin;