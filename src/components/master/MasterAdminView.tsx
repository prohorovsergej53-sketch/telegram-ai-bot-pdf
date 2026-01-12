import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="Users" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{tenants.length}</p>
                <p className="text-xs text-slate-600">Всего тенантов</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="CheckCircle" size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {tenants.filter(t => t.status === 'active').length}
                </p>
                <p className="text-xs text-slate-600">Активных</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icon name="GitBranch" size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{versions.length}</p>
                <p className="text-xs text-slate-600">Версий</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Icon name="Zap" size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {tenants.filter(t => t.auto_update).length}
                </p>
                <p className="text-xs text-slate-600">Авто-обновление</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Версии мастер-шаблона</CardTitle>
            <CardDescription>История версий кода</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {versions.map((version) => (
                  <div
                    key={version.version}
                    className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-semibold text-slate-900">{version.version}</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {version.tenant_count} тенантов
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{version.description}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{new Date(version.created_at).toLocaleDateString('ru-RU')}</span>
                      <span>•</span>
                      <span>{version.created_by}</span>
                      <span>•</span>
                      <span className="font-mono">{version.code_hash}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Массовое обновление</CardTitle>
                <CardDescription>
                  {selectedTenants.length > 0
                    ? `Выбрано: ${selectedTenants.length} тенантов`
                    : 'Обновить всех с авто-обновлением'}
                </CardDescription>
              </div>
              <Dialog open={showBulkUpdateDialog} onOpenChange={setShowBulkUpdateDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Icon name="RefreshCw" size={16} className="mr-2" />
                    Обновить
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Массовое обновление тенантов</DialogTitle>
                    <DialogDescription>
                      {selectedTenants.length > 0
                        ? `Будут обновлены ${selectedTenants.length} выбранных тенантов`
                        : 'Будут обновлены все тенанты с включенным авто-обновлением'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Целевая версия</Label>
                      <select
                        className="w-full mt-2 px-3 py-2 border rounded-lg"
                        value={bulkUpdateTarget}
                        onChange={(e) => setBulkUpdateTarget(e.target.value)}
                      >
                        <option value="">Выберите версию</option>
                        {versions.map((v) => (
                          <option key={v.version} value={v.version}>
                            {v.version} - {v.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm text-amber-800">
                        <Icon name="AlertTriangle" size={16} className="inline mr-1" />
                        Обновится только код, настройки тенантов не изменятся
                      </p>
                    </div>
                    <Button onClick={handleBulkUpdate} disabled={isLoading} className="w-full">
                      {isLoading ? 'Обновление...' : 'Подтвердить обновление'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button size="sm" variant="outline" onClick={selectAll}>
                Выбрать всех
              </Button>
              <Button size="sm" variant="outline" onClick={deselectAll}>
                Сбросить
              </Button>
            </div>
            <ScrollArea className="h-[340px]">
              <div className="space-y-2">
                {tenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTenants.includes(tenant.id)
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-slate-50'
                    }`}
                    onClick={() => toggleTenantSelection(tenant.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedTenants.includes(tenant.id)}
                          onChange={() => {}}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="font-medium text-slate-900">{tenant.name}</p>
                          <p className="text-xs text-slate-500">{tenant.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {tenant.auto_update && (
                          <Icon name="Zap" size={14} className="text-orange-500" title="Авто-обновление" />
                        )}
                        <span className="text-xs font-mono text-slate-600">{tenant.template_version}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список тенантов</CardTitle>
          <CardDescription>Все созданные пары админка+чат</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {tenants.map((tenant) => (
                <div key={tenant.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-900">{tenant.name}</h4>
                      <p className="text-sm text-slate-600">/{tenant.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        tenant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {tenant.status}
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono">
                        {tenant.template_version}
                      </span>
                    </div>
                  </div>
                  {tenant.description && (
                    <p className="text-sm text-slate-600 mb-2">{tenant.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Icon name="FileText" size={12} />
                      {tenant.doc_count} документов
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="MessageCircle" size={12} />
                      {tenant.message_count} сообщений
                    </span>
                    {tenant.owner_email && (
                      <span className="flex items-center gap-1">
                        <Icon name="Mail" size={12} />
                        {tenant.owner_email}
                      </span>
                    )}
                    {tenant.auto_update && (
                      <span className="flex items-center gap-1 text-orange-600">
                        <Icon name="Zap" size={12} />
                        Авто-обновление
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterAdminView;