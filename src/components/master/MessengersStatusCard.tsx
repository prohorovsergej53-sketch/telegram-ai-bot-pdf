import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface MessengerStatus {
  telegram: boolean;
  whatsapp: boolean;
  vk: boolean;
}

interface Tenant {
  id: number;
  slug: string;
  name: string;
  telegram_connected?: boolean;
  whatsapp_connected?: boolean;
  vk_connected?: boolean;
}

interface MessengersStatusCardProps {
  tenants: Tenant[];
}

const MessengersStatusCard = ({ tenants }: MessengersStatusCardProps) => {
  const [statuses, setStatuses] = useState<Record<number, MessengerStatus>>({});

  useEffect(() => {
    const newStatuses: Record<number, MessengerStatus> = {};
    
    tenants.forEach(tenant => {
      newStatuses[tenant.id] = {
        telegram: tenant.telegram_connected || false,
        whatsapp: tenant.whatsapp_connected || false,
        vk: tenant.vk_connected || false
      };
    });
    
    setStatuses(newStatuses);
  }, [tenants]);

  const getTotalConnected = (messenger: 'telegram' | 'whatsapp' | 'vk') => {
    return Object.values(statuses).filter(s => s[messenger]).length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="MessageCircle" size={20} />
          Статус мессенджеров
        </CardTitle>
        <CardDescription>
          Подключение Telegram, WhatsApp и VK ботов для всех тенантов
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-blue-50/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="Send" size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Telegram</p>
                  <p className="text-xs text-slate-600">
                    {getTotalConnected('telegram')} из {tenants.length} подключено
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${tenants.length > 0 ? (getTotalConnected('telegram') / tenants.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {tenants.length > 0 ? Math.round((getTotalConnected('telegram') / tenants.length) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-green-50/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="MessageSquare" size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">WhatsApp</p>
                  <p className="text-xs text-slate-600">
                    {getTotalConnected('whatsapp')} из {tenants.length} подключено
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${tenants.length > 0 ? (getTotalConnected('whatsapp') / tenants.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {tenants.length > 0 ? Math.round((getTotalConnected('whatsapp') / tenants.length) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-purple-50/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon name="MessageSquare" size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">VK</p>
                  <p className="text-xs text-slate-600">
                    {getTotalConnected('vk')} из {tenants.length} подключено
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${tenants.length > 0 ? (getTotalConnected('vk') / tenants.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {tenants.length > 0 ? Math.round((getTotalConnected('vk') / tenants.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {tenants.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-slate-700 mb-3">Детальный статус по тенантам:</p>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {tenants.map(tenant => (
                  <div key={tenant.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{tenant.name}</p>
                      <p className="text-xs text-slate-600">/{tenant.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge 
                        variant={statuses[tenant.id]?.telegram ? 'default' : 'outline'}
                        className={statuses[tenant.id]?.telegram ? 'bg-blue-600' : ''}
                      >
                        <Icon name="Send" size={12} className="mr-1" />
                        TG
                      </Badge>
                      <Badge 
                        variant={statuses[tenant.id]?.whatsapp ? 'default' : 'outline'}
                        className={statuses[tenant.id]?.whatsapp ? 'bg-green-600' : ''}
                      >
                        <Icon name="Phone" size={12} className="mr-1" />
                        WA
                      </Badge>
                      <Badge 
                        variant={statuses[tenant.id]?.vk ? 'default' : 'outline'}
                        className={statuses[tenant.id]?.vk ? 'bg-purple-600' : ''}
                      >
                        <Icon name="MessageSquare" size={12} className="mr-1" />
                        VK
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MessengersStatusCard;