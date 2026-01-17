import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Tenant } from './types';

interface TenantsTabProps {
  tenants: Tenant[];
  onEnterTenant: (tenant: Tenant) => void;
  onManageTenant: (tenant: Tenant) => void;
  onCreateTenant: () => void;
  onToggleFz152: (tenant: Tenant) => void;
}

export const TenantsTab = ({ tenants, onEnterTenant, onManageTenant, onCreateTenant, onToggleFz152 }: TenantsTabProps) => {
  const clientTenants = tenants.filter(tenant => tenant.id !== 1);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Управление клиентами</CardTitle>
            <CardDescription>Все боты в системе</CardDescription>
          </div>
          <Button onClick={onCreateTenant}>
            <Icon name="Plus" size={16} className="mr-2" />
            Создать клиента
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clientTenants.map(tenant => (
            <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{tenant.name}</h3>
                  <Badge>{tenant.tariff_id}</Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Slug: {tenant.slug}</div>
                  <div>Документов: {tenant.documents_count} • Админов: {tenant.admins_count}</div>
                  {tenant.admin_emails && (
                    <div className="flex items-center gap-1">
                      <Icon name="Mail" size={14} />
                      <span>{tenant.admin_emails}</span>
                    </div>
                  )}
                  {tenant.subscription_end_date && (
                    <div>Подписка до: {new Date(tenant.subscription_end_date).toLocaleDateString('ru-RU')}</div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-medium">152-ФЗ:</span>
                    <button
                      onClick={() => onToggleFz152(tenant)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        tenant.fz152_enabled 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tenant.fz152_enabled ? 'Включено' : 'Выключено'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => onEnterTenant(tenant)}
                >
                  <Icon name="LogIn" size={16} className="mr-2" />
                  Войти в админку
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onManageTenant(tenant)}
                >
                  <Icon name="Settings" size={16} className="mr-2" />
                  Настройки
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};