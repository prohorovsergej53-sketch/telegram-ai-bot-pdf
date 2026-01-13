import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TariffManagementCard from '@/components/superadmin/TariffManagementCard';
import { isSuperAdmin } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MasterDashboardStats from '@/components/master/MasterDashboardStats';
import TenantsListTable from '@/components/master/TenantsListTable';
import AdminUsersPanel from '@/components/master/AdminUsersPanel';
import MessengersStatusCard from '@/components/master/MessengersStatusCard';
import CreateTenantWithUserPanel from '@/components/master/CreateTenantWithUserPanel';
import DefaultSettingsPanel from '@/components/master/DefaultSettingsPanel';
import VersionsList from '@/components/master/VersionsList';
import BulkUpdatePanel from '@/components/master/BulkUpdatePanel';
import UsersManagementPanel from '@/components/master/UsersManagementPanel';

interface CompanyInfo {
  name: string;
  inn: string;
  email: string;
  phone: string;
  address: string;
  legalForm: string;
}

interface Tenant {
  id: number;
  slug: string;
  name: string;
  description: string;
  owner_email: string;
}

interface Version {
  version: string;
  description: string;
  code_hash: string;
  created_at: string;
  created_by: string;
  tenant_count: number;
}

const STORAGE_KEY = 'company_info';
const BACKEND_URLS = {
  tenants: 'https://functions.poehali.dev/2163d682-19a2-462b-b577-7f04219cc3c8',
  bulkUpdate: 'https://functions.poehali.dev/06059507-42f3-4144-bcb9-b152556cd5ae',
  versions: 'https://functions.poehali.dev/7f6c3892-47f2-47aa-91b0-541f0de7c211'
};

const SuperAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'Прохоров С. В.',
    inn: '910800040469',
    email: 'info@298100.ru',
    phone: '+7 (978) 723-60-35',
    address: 'Республика Крым, г. Феодосия',
    legalForm: 'Плательщик НПД'
  });
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSuperAdmin()) {
      navigate('/admin');
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCompanyInfo(JSON.parse(saved));
    }
    loadTenants();
    loadVersions();
  }, [navigate]);

  const loadTenants = async () => {
    try {
      const response = await fetch(BACKEND_URLS.tenants);
      const data = await response.json();
      if (data.tenants) {
        setTenants(data.tenants);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVersions = async () => {
    try {
      const response = await fetch(BACKEND_URLS.versions);
      const data = await response.json();
      setVersions(data.versions || []);
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companyInfo));
    toast({
      title: 'Сохранено',
      description: 'Реквизиты компании обновлены'
    });
  };

  if (!isSuperAdmin()) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Icon name="Loader2" className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Мастер-панель управления</h1>
          <p className="text-slate-600">Полный контроль над платформой, клиентами и настройками</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 lg:w-auto">
            <TabsTrigger value="dashboard">
              <Icon name="LayoutDashboard" size={16} className="mr-2" />
              Дашборд
            </TabsTrigger>
            <TabsTrigger value="tenants">
              <Icon name="Users" size={16} className="mr-2" />
              Клиенты
            </TabsTrigger>
            <TabsTrigger value="versions">
              <Icon name="GitBranch" size={16} className="mr-2" />
              Версии
            </TabsTrigger>
            <TabsTrigger value="bulk-update">
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Массовое обновление
            </TabsTrigger>
            <TabsTrigger value="admins">
              <Icon name="Shield" size={16} className="mr-2" />
              Админы
            </TabsTrigger>
            <TabsTrigger value="users">
              <Icon name="UserCog" size={16} className="mr-2" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="tariffs">
              <Icon name="Package" size={16} className="mr-2" />
              Тарифы
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Icon name="Settings" size={16} className="mr-2" />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <MasterDashboardStats tenants={tenants} />
            <MessengersStatusCard tenants={tenants} />
          </TabsContent>

          <TabsContent value="tenants" className="space-y-6">
            <CreateTenantWithUserPanel onSuccess={loadTenants} />
            <TenantsListTable tenants={tenants} onUpdate={loadTenants} />
          </TabsContent>

          <TabsContent value="admins" className="space-y-6">
            <AdminUsersPanel />
          </TabsContent>

          <TabsContent value="versions" className="space-y-6">
            <VersionsList versions={versions} onRefresh={loadVersions} />
          </TabsContent>

          <TabsContent value="bulk-update" className="space-y-6">
            <BulkUpdatePanel tenants={tenants} />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UsersManagementPanel />
          </TabsContent>

          <TabsContent value="tariffs" className="space-y-6">
            <TariffManagementCard />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <DefaultSettingsPanel />
            
            <Card>
              <CardHeader>
                <CardTitle>Реквизиты компании</CardTitle>
                <CardDescription>Данные для юридических документов и контактов</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="legalForm">Форма собственности</Label>
                    <Input
                      id="legalForm"
                      value={companyInfo.legalForm}
                      onChange={(e) => setCompanyInfo({...companyInfo, legalForm: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">ФИО / Название</Label>
                    <Input
                      id="name"
                      value={companyInfo.name}
                      onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inn">ИНН</Label>
                    <Input
                      id="inn"
                      value={companyInfo.inn}
                      onChange={(e) => setCompanyInfo({...companyInfo, inn: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={companyInfo.email}
                      onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                      id="phone"
                      value={companyInfo.phone}
                      onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Адрес</Label>
                    <Input
                      id="address"
                      value={companyInfo.address}
                      onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={handleSave}>
                  <Icon name="Save" className="mr-2" size={16} />
                  Сохранить реквизиты
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Settings" size={20} />
                  Быстрый доступ к админке клиента
                </CardTitle>
                <CardDescription>
                  Перейдите в админку любого клиента для полного доступа ко всем настройкам
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tenant-select">Выберите клиента</Label>
                  <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                    <SelectTrigger id="tenant-select">
                      <SelectValue placeholder="Выберите клиента из списка" />
                    </SelectTrigger>
                    <SelectContent>
                      {(tenants || []).map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.slug}>
                          {tenant.name} (/{tenant.slug})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => {
                    if (selectedTenant) {
                      sessionStorage.setItem('superadmin_viewing_tenant', 'true');
                      navigate(`/${selectedTenant}/admin`);
                    }
                  }}
                  disabled={!selectedTenant}
                  className="w-full"
                >
                  <Icon name="ArrowRight" className="mr-2" size={16} />
                  Перейти в админку клиента
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdmin;