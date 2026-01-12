import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface Tenant {
  id: number;
  slug: string;
  name: string;
  template_version: string;
  auto_update: boolean;
}

interface Version {
  version: string;
  description: string;
}

interface BulkUpdatePanelProps {
  tenants: Tenant[];
  versions: Version[];
  selectedTenants: number[];
  bulkUpdateTarget: string;
  isLoading: boolean;
  showBulkUpdateDialog: boolean;
  onToggleSelection: (tenantId: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSetBulkUpdateTarget: (version: string) => void;
  onBulkUpdate: () => void;
  onSetShowDialog: (show: boolean) => void;
}

const BulkUpdatePanel = ({
  tenants,
  versions,
  selectedTenants,
  bulkUpdateTarget,
  isLoading,
  showBulkUpdateDialog,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  onSetBulkUpdateTarget,
  onBulkUpdate,
  onSetShowDialog
}: BulkUpdatePanelProps) => {
  return (
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
          <Dialog open={showBulkUpdateDialog} onOpenChange={onSetShowDialog}>
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
                    onChange={(e) => onSetBulkUpdateTarget(e.target.value)}
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
                <Button onClick={onBulkUpdate} disabled={isLoading} className="w-full">
                  {isLoading ? 'Обновление...' : 'Подтвердить обновление'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button size="sm" variant="outline" onClick={onSelectAll}>
            Выбрать всех
          </Button>
          <Button size="sm" variant="outline" onClick={onDeselectAll}>
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
                onClick={() => onToggleSelection(tenant.id)}
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
  );
};

export default BulkUpdatePanel;
