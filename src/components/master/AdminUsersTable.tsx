import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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

interface AdminUsersTableProps {
  users: AdminUser[];
  onEditPassword: (user: AdminUser) => void;
  onToggleActive: (userId: number, currentActive: boolean) => void;
  getRoleBadge: (role: string) => JSX.Element;
}

export const AdminUsersTable = ({
  users,
  onEditPassword,
  onToggleActive,
  getRoleBadge
}: AdminUsersTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Логин</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Роль</TableHead>
          <TableHead>Пара</TableHead>
          <TableHead>Статус</TableHead>
          <TableHead>Последний вход</TableHead>
          <TableHead>Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.username}</TableCell>
            <TableCell>{user.email || '—'}</TableCell>
            <TableCell>{getRoleBadge(user.role)}</TableCell>
            <TableCell>
              {user.tenant_name ? (
                <span className="text-sm">
                  {user.tenant_name}
                  <span className="text-muted-foreground ml-1">(ID: {user.tenant_id})</span>
                </span>
              ) : (
                '—'
              )}
            </TableCell>
            <TableCell>
              {user.is_active ? (
                <Badge className="bg-green-100 text-green-800">Активен</Badge>
              ) : (
                <Badge variant="secondary">Заблокирован</Badge>
              )}
            </TableCell>
            <TableCell>
              {user.last_login_at
                ? new Date(user.last_login_at).toLocaleString('ru-RU')
                : 'Никогда'}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditPassword(user)}
                >
                  <Icon name="Key" size={14} />
                </Button>
                <Button
                  size="sm"
                  variant={user.is_active ? 'destructive' : 'default'}
                  onClick={() => onToggleActive(user.id, user.is_active)}
                >
                  <Icon name={user.is_active ? 'UserX' : 'UserCheck'} size={14} />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
