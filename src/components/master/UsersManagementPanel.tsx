import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const BACKEND_URL = 'https://functions.poehali.dev/2163d682-19a2-462b-b577-7f04219cc3c8';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  tenant_id: number;
  tenant_name: string;
  tenant_slug: string;
  is_active: boolean;
  is_public: boolean;
  subscription_status: string;
  subscription_end_date: string | null;
  tariff_id: string | null;
  created_at: string;
}

const UsersManagementPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}?action=users_list`);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить пользователей', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      const response = await fetch(`${BACKEND_URL}?action=toggle_user_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, is_active: isActive })
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'Статус пользователя обновлен' });
        loadUsers();
      } else {
        throw new Error('Failed to toggle user status');
      }
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    }
  };

  const toggleTenantPublic = async (tenantId: number, isPublic: boolean) => {
    try {
      const response = await fetch(`${BACKEND_URL}?action=toggle_tenant_public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenantId, is_public: isPublic })
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'Публичная видимость обновлена' });
        loadUsers();
      } else {
        throw new Error('Failed to toggle tenant public status');
      }
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Активна</Badge>;
      case 'expired':
        return <Badge variant="destructive">Истекла</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Отменена</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon name="Loader2" className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Управление пользователями</h2>
        <p className="text-muted-foreground">
          Пользователи, созданные после оплаты подписки
        </p>
      </div>

      <div className="space-y-4">
        {users.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Пока нет пользователей</p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {user.tenant_name}
                      {!user.is_active && (
                        <Badge variant="secondary">Неактивен</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      @{user.tenant_slug} • {user.email}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(user.subscription_status)}
                    {user.tariff_id && (
                      <Badge variant="outline">{user.tariff_id}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Логин:</span>
                    <p className="font-mono">{user.username}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Роль:</span>
                    <p>{user.role === 'content_editor' ? 'Редактор контента' : user.role}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Создан:</span>
                    <p>{new Date(user.created_at).toLocaleString('ru-RU')}</p>
                  </div>
                  {user.subscription_end_date && (
                    <div>
                      <span className="text-muted-foreground">Подписка до:</span>
                      <p>{new Date(user.subscription_end_date).toLocaleDateString('ru-RU')}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={user.is_active}
                      onCheckedChange={(checked) => toggleUserStatus(user.id, checked)}
                    />
                    <span className="text-sm">Пользователь активен</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={user.is_public}
                      onCheckedChange={(checked) => toggleTenantPublic(user.tenant_id, checked)}
                    />
                    <span className="text-sm">Публичный доступ</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default UsersManagementPanel;
