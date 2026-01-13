import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { authenticatedFetch } from '@/lib/auth';
import { CreateAdminDialog } from './CreateAdminDialog';
import { EditPasswordDialog } from './EditPasswordDialog';
import { AdminUsersTable } from './AdminUsersTable';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'super_admin' | 'tenant_admin';
  tenant_id: number | null;
  tenant_name?: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

const BACKEND_URL = 'https://functions.poehali.dev/c9e558c6-9e35-48fd-9948-69e7fc9ba377';

const AdminUsersPanel = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const { toast } = useToast();

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    email: '',
    role: 'tenant_admin' as 'super_admin' | 'tenant_admin',
    tenant_id: null as number | null
  });

  const [editPassword, setEditPassword] = useState({
    user_id: 0,
    new_password: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await authenticatedFetch(BACKEND_URL);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список администраторов',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password) {
      toast({
        title: 'Ошибка',
        description: 'Заполните логин и пароль',
        variant: 'destructive'
      });
      return;
    }

    if (newUser.role === 'tenant_admin' && !newUser.tenant_id) {
      toast({
        title: 'Ошибка',
        description: 'Для мини-админа укажите ID пары',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authenticatedFetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Администратор создан'
        });
        setShowCreateDialog(false);
        setNewUser({
          username: '',
          password: '',
          email: '',
          role: 'tenant_admin',
          tenant_id: null
        });
        loadUsers();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!editPassword.new_password) {
      toast({
        title: 'Ошибка',
        description: 'Введите новый пароль',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authenticatedFetch(BACKEND_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editPassword)
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Пароль изменён'
        });
        setShowEditDialog(false);
        setEditPassword({ user_id: 0, new_password: '' });
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(BACKEND_URL, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, is_active: !currentActive })
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: currentActive ? 'Доступ заблокирован' : 'Доступ разблокирован'
        });
        loadUsers();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'super_admin' ? (
      <Badge className="bg-purple-100 text-purple-800 border-purple-200">Супер-админ</Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200">Мини-админ</Badge>
    );
  };

  const handleEditPassword = (user: AdminUser) => {
    setSelectedUser(user);
    setEditPassword({ user_id: user.id, new_password: '' });
    setShowEditDialog(true);
  };

  if (isLoading && users.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Icon name="Loader2" className="animate-spin" size={24} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" size={20} />
              Администраторы
            </CardTitle>
            <CardDescription>
              Управление учётными записями администраторов системы
            </CardDescription>
          </div>
          <CreateAdminDialog
            open={showCreateDialog}
            newUser={newUser}
            isLoading={isLoading}
            onOpenChange={setShowCreateDialog}
            onUserChange={setNewUser}
            onCreate={handleCreateUser}
          />
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Администраторов пока нет
          </div>
        ) : (
          <AdminUsersTable
            users={users}
            onEditPassword={handleEditPassword}
            onToggleActive={handleToggleActive}
            getRoleBadge={getRoleBadge}
          />
        )}
      </CardContent>

      <EditPasswordDialog
        open={showEditDialog}
        username={selectedUser?.username || ''}
        password={editPassword}
        isLoading={isLoading}
        onOpenChange={setShowEditDialog}
        onPasswordChange={setEditPassword}
        onSave={handleChangePassword}
      />
    </Card>
  );
};

export default AdminUsersPanel;
