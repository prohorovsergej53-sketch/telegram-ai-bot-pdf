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

const STORAGE_KEY = 'company_info';

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
  const [selectedTenant, setSelectedTenant] = useState<string>('');

  useEffect(() => {
    if (!isSuperAdmin()) {
      navigate('/admin');
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCompanyInfo(JSON.parse(saved));
    }
    loadTenants();
  }, [navigate]);

  const loadTenants = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/2163d682-19a2-462b-b577-7f04219cc3c8');
      const data = await response.json();
      if (data.tenants) {
        setTenants(data.tenants);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
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

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Суперадмин-панель</h1>
          <p className="text-slate-600">Управление тарифами и настройками платформы</p>
        </div>

        <div className="space-y-6">
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
                Управление настройками клиентов
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
                    {tenants.map((tenant) => (
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
                Перейти в админку
              </Button>
            </CardContent>
          </Card>
          
          <TariffManagementCard />
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;