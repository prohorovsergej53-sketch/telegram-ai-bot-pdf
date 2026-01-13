import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSuperAdmin, authenticatedFetch } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface Tariff {
  id: string;
  name: string;
  price: number;
  period: string;
  is_active: boolean;
}

interface Tenant {
  id: number;
  slug: string;
  name: string;
  description: string;
  tariff_id: string;
  subscription_end_date: string;
  documents_count: number;
  admins_count: number;
  created_at: string;
}

const BACKEND_URLS = {
  tariffs: 'https://functions.poehali.dev/9aaca202-0192-4234-9f65-591df1552960',
  tenants: 'https://functions.poehali.dev/b1bdd2fb-cf88-4093-a3d7-15d273763e4c'
};

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
    toast({
      title: 'Управление клиентом',
      description: `Открываю настройки для ${tenant.name}`,
    });
    console.log('Managing tenant:', tenant);
  };

  const handleEditTariff = (tariff: Tariff) => {
    toast({
      title: 'Редактирование тарифа',
      description: `Открываю редактор для ${tariff.name}`,
    });
    console.log('Editing tariff:', tariff);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Шапка */}
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

        {/* Вкладки */}
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

          {/* Дашборд */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Всего клиентов</CardDescription>
                  <CardTitle className="text-4xl">{tenants.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Icon name="TrendingUp" size={16} className="mr-1 text-green-600" />
                    <span>Активные</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Тарифных планов</CardDescription>
                  <CardTitle className="text-4xl">{tariffs.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Icon name="Package" size={16} className="mr-1" />
                    <span>Доступно</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Документов в системе</CardDescription>
                  <CardTitle className="text-4xl">
                    {tenants.reduce((sum, t) => sum + t.documents_count, 0)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Icon name="FileText" size={16} className="mr-1" />
                    <span>Обработано</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Последние клиенты</CardTitle>
                <CardDescription>Недавно созданные боты</CardDescription>
              </CardHeader>
              <CardContent>
                {tenants.slice(0, 5).map(tenant => (
                  <div key={tenant.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <div className="font-medium">{tenant.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {tenant.slug} • {tenant.documents_count} документов
                      </div>
                    </div>
                    <Badge variant={tenant.tariff_id === 'enterprise' ? 'default' : 'secondary'}>
                      {tenant.tariff_id}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Клиенты */}
          <TabsContent value="tenants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление клиентами</CardTitle>
                <CardDescription>Все боты в системе</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tenants.map(tenant => (
                    <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{tenant.name}</h3>
                          <Badge>{tenant.tariff_id}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Slug: {tenant.slug}</div>
                          <div>Документов: {tenant.documents_count} • Админов: {tenant.admins_count}</div>
                          {tenant.subscription_end_date && (
                            <div>Подписка до: {new Date(tenant.subscription_end_date).toLocaleDateString('ru-RU')}</div>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleManageTenant(tenant)}
                      >
                        <Icon name="Settings" size={16} className="mr-2" />
                        Управление
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Тарифы */}
          <TabsContent value="tariffs" className="space-y-6">
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
                        <div className="text-sm text-muted-foreground">
                          {tariff.price.toLocaleString('ru-RU')} ₽ / {tariff.period}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditTariff(tariff)}
                      >
                        <Icon name="Edit" size={16} className="mr-2" />
                        Редактировать
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdmin;