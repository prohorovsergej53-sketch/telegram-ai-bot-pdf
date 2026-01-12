import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface Tenant {
  id: number;
  slug: string;
  name: string;
  description: string;
  owner_email: string;
  template_version: string;
  status: string;
  doc_count: number;
  message_count: number;
  auto_update: boolean;
}

interface TenantsListTableProps {
  tenants: Tenant[];
}

const TenantsListTable = ({ tenants }: TenantsListTableProps) => {
  const navigate = useNavigate();

  return (
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
                <div className="flex items-center justify-between">
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
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/${tenant.slug}/admin`)}
                    >
                      <Icon name="Settings" size={14} className="mr-1" />
                      Админка
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/${tenant.slug}`)}
                    >
                      <Icon name="MessageSquare" size={14} className="mr-1" />
                      Чат
                    </Button>
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

export default TenantsListTable;