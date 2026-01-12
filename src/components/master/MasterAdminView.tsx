import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import MasterDashboardStats from './MasterDashboardStats';
import VersionsList from './VersionsList';
import BulkUpdatePanel from './BulkUpdatePanel';
import TenantsListTable from './TenantsListTable';

interface Tenant {
  id: number;
  slug: string;
  name: string;
  description: string;
  owner_email: string;
  owner_phone: string;
  template_version: string;
  auto_update: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  doc_count: number;
  message_count: number;
}

interface Version {
  version: string;
  description: string;
  code_hash: string;
  created_at: string;
  created_by: string;
  tenant_count: number;
}

const BACKEND_URLS = {
  tenants: 'https://functions.poehali.dev/2163d682-19a2-462b-b577-7f04219cc3c8',
  bulkUpdate: 'https://functions.poehali.dev/06059507-42f3-4144-bcb9-b152556cd5ae',
  versions: 'https://functions.poehali.dev/7f6c3892-47f2-47aa-91b0-541f0de7c211'
};

const MasterAdminView = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTenants, setSelectedTenants] = useState<number[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const { toast } = useToast();

  const [newTenant, setNewTenant] = useState({
    slug: '',
    name: '',
    description: '',
    owner_email: '',
    owner_phone: '',
    auto_update: false
  });

  const [newVersion, setNewVersion] = useState({
    version: '',
    description: ''
  });

  const [bulkUpdateTarget, setBulkUpdateTarget] = useState('');

  useEffect(() => {
    loadTenants();
    loadVersions();
  }, []);

  const loadTenants = async () => {
    try {
      const response = await fetch(BACKEND_URLS.tenants);
      const data = await response.json();
      setTenants(data.tenants || []);
    } catch (error) {
      console.error('Error loading tenants:', error);
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

  const handleCreateTenant = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(BACKEND_URLS.tenants, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTenant)
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'Тенант создан' });
        setShowCreateDialog(false);
        setNewTenant({ slug: '', name: '', description: '', owner_email: '', owner_phone: '', auto_update: false });
        loadTenants();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(BACKEND_URLS.versions, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.dumps({ ...newVersion, created_by: 'admin' })
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'Версия создана' });
        setShowVersionDialog(false);
        setNewVersion({ version: '', description: '' });
        loadVersions();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkUpdateTarget) {
      toast({ title: 'Ошибка', description: 'Выберите версию для обновления', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(BACKEND_URLS.bulkUpdate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.dumps({
          target_version: bulkUpdateTarget,
          tenant_ids: selectedTenants,
          update_all: selectedTenants.length === 0,
          updated_by: 'admin'
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Обновление завершено',
          description: `Обновлено: ${data.updated_count}, Ошибок: ${data.failed_count}`
        });
        setShowBulkUpdateDialog(false);
        setSelectedTenants([]);
        loadTenants();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTenantSelection = (tenantId: number) => {
    setSelectedTenants(prev =>
      prev.includes(tenantId) ? prev.filter(id => id !== tenantId) : [...prev, tenantId]
    );
  };

  const selectAll = () => {
    setSelectedTenants(tenants.map(t => t.id));
  };

  const deselectAll = () => {
    setSelectedTenants([]);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Мастер-админка</h1>
          <p className="text-slate-600">Управление AI чат-ботами</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Icon name="GitBranch" size={16} className="mr-2" />
                Новая версия
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать версию мастер-шаблона</DialogTitle>
                <DialogDescription>
                  Новая версия кода для обновления тенантов
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Версия (например, 1.1.0)</Label>
                  <Input
                    value={newVersion.version}
                    onChange={(e) => setNewVersion({ ...newVersion, version: e.target.value })}
                    placeholder="1.1.0"
                  />
                </div>
                <div>
                  <Label>Описание изменений</Label>
                  <Textarea
                    value={newVersion.description}
                    onChange={(e) => setNewVersion({ ...newVersion, description: e.target.value })}
                    placeholder="Добавлен новый функционал..."
                  />
                </div>
                <Button onClick={handleCreateVersion} disabled={isLoading} className="w-full">
                  Создать версию
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Icon name="Plus" size={16} className="mr-2" />
                Создать тенант
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать новую пару (админка + чат)</DialogTitle>
                <DialogDescription>
                  Новый AI чат-бот для клиента
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Slug (URL-адрес)</Label>
                  <Input
                    value={newTenant.slug}
                    onChange={(e) => setNewTenant({ ...newTenant, slug: e.target.value })}
                    placeholder="hotel-pushkin"
                  />
                </div>
                <div>
                  <Label>Название</Label>
                  <Input
                    value={newTenant.name}
                    onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                    placeholder="Отель Пушкин"
                  />
                </div>
                <div>
                  <Label>Описание</Label>
                  <Textarea
                    value={newTenant.description}
                    onChange={(e) => setNewTenant({ ...newTenant, description: e.target.value })}
                    placeholder="AI-консьерж для отеля"
                  />
                </div>
                <div>
                  <Label>Email владельца</Label>
                  <Input
                    type="email"
                    value={newTenant.owner_email}
                    onChange={(e) => setNewTenant({ ...newTenant, owner_email: e.target.value })}
                    placeholder="owner@example.com"
                  />
                </div>
                <div>
                  <Label>Телефон владельца</Label>
                  <Input
                    value={newTenant.owner_phone}
                    onChange={(e) => setNewTenant({ ...newTenant, owner_phone: e.target.value })}
                    placeholder="+7 999 123-45-67"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto_update">Авто-обновление</Label>
                  <Switch
                    id="auto_update"
                    checked={newTenant.auto_update}
                    onCheckedChange={(checked) => setNewTenant({ ...newTenant, auto_update: checked })}
                  />
                </div>
                <Button onClick={handleCreateTenant} disabled={isLoading} className="w-full">
                  Создать тенант
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <MasterDashboardStats tenants={tenants} versionsCount={versions.length} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VersionsList versions={versions} />
        <BulkUpdatePanel
          tenants={tenants}
          versions={versions}
          selectedTenants={selectedTenants}
          bulkUpdateTarget={bulkUpdateTarget}
          isLoading={isLoading}
          showBulkUpdateDialog={showBulkUpdateDialog}
          onToggleSelection={toggleTenantSelection}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
          onSetBulkUpdateTarget={setBulkUpdateTarget}
          onBulkUpdate={handleBulkUpdate}
          onSetShowDialog={setShowBulkUpdateDialog}
        />
      </div>

      <TenantsListTable tenants={tenants} />
    </div>
  );
};

export default MasterAdminView;
