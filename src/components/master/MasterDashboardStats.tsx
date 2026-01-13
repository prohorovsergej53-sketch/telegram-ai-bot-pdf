import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Tenant {
  id: number;
  status: string;
  auto_update: boolean;
}

interface MasterDashboardStatsProps {
  tenants: Tenant[];
  versionsCount?: number;
}

const MasterDashboardStats = ({ tenants, versionsCount = 0 }: MasterDashboardStatsProps) => {
  return (
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
              <p className="text-2xl font-bold text-slate-900">{versionsCount}</p>
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
  );
};

export default MasterDashboardStats;