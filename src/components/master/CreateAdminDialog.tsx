import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface NewUser {
  username: string;
  password: string;
  email: string;
  role: 'super_admin' | 'tenant_admin';
  tenant_id: number | null;
}

interface CreateAdminDialogProps {
  open: boolean;
  newUser: NewUser;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onUserChange: (user: NewUser) => void;
  onCreate: () => void;
}

export const CreateAdminDialog = ({
  open,
  newUser,
  isLoading,
  onOpenChange,
  onUserChange,
  onCreate
}: CreateAdminDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Icon name="Plus" size={16} className="mr-2" />
          Создать администратора
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать администратора</DialogTitle>
          <DialogDescription>
            Добавьте нового администратора в систему
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Логин</Label>
            <Input
              value={newUser.username}
              onChange={(e) => onUserChange({ ...newUser, username: e.target.value })}
              placeholder="admin_hotel"
            />
          </div>
          <div>
            <Label>Пароль</Label>
            <Input
              type="password"
              value={newUser.password}
              onChange={(e) => onUserChange({ ...newUser, password: e.target.value })}
              placeholder="Введите пароль"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={newUser.email}
              onChange={(e) => onUserChange({ ...newUser, email: e.target.value })}
              placeholder="admin@hotel.com"
            />
          </div>
          <div>
            <Label>Роль</Label>
            <select
              value={newUser.role}
              onChange={(e) => onUserChange({ ...newUser, role: e.target.value as any })}
              className="w-full p-2 border rounded-lg"
            >
              <option value="tenant_admin">Мини-админ (доступ к своей паре)</option>
              <option value="super_admin">Супер-админ (полный доступ)</option>
            </select>
          </div>
          {newUser.role === 'tenant_admin' && (
            <div>
              <Label>ID пары (tenant_id)</Label>
              <Input
                type="number"
                value={newUser.tenant_id || ''}
                onChange={(e) => onUserChange({ ...newUser, tenant_id: parseInt(e.target.value) || null })}
                placeholder="1"
              />
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Отмена
            </Button>
            <Button onClick={onCreate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                  Создание...
                </>
              ) : (
                'Создать'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
