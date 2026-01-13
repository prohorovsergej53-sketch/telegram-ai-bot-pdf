import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface EditPasswordData {
  user_id: number;
  new_password: string;
}

interface EditPasswordDialogProps {
  open: boolean;
  username: string;
  password: EditPasswordData;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onPasswordChange: (password: EditPasswordData) => void;
  onSave: () => void;
}

export const EditPasswordDialog = ({
  open,
  username,
  password,
  isLoading,
  onOpenChange,
  onPasswordChange,
  onSave
}: EditPasswordDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Изменить пароль</DialogTitle>
          <DialogDescription>
            Смена пароля для: <strong>{username}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Новый пароль</Label>
            <Input
              type="password"
              value={password.new_password}
              onChange={(e) => onPasswordChange({ ...password, new_password: e.target.value })}
              placeholder="Введите новый пароль"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Отмена
            </Button>
            <Button onClick={onSave} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                  Сохранение...
                </>
              ) : (
                'Сохранить'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
