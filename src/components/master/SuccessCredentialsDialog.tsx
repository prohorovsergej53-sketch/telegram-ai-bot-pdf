import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface CreatedUser {
  user_id: number;
  username: string;
  password: string;
  email_sent: boolean;
}

interface SuccessCredentialsDialogProps {
  open: boolean;
  createdUser: CreatedUser | null;
  onOpenChange: (open: boolean) => void;
  onCopy: (text: string) => void;
}

export const SuccessCredentialsDialog = ({
  open,
  createdUser,
  onOpenChange,
  onCopy
}: SuccessCredentialsDialogProps) => {
  if (!createdUser) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="CheckCircle" className="text-green-600" size={24} />
            Тенант и пользователь созданы
          </DialogTitle>
          <DialogDescription>
            {createdUser.email_sent 
              ? 'Email с доступами отправлен на почту владельца'
              : 'SMTP не настроен — скопируйте данные и отправьте владельцу вручную'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-slate-100 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Логин</p>
                <p className="text-lg font-mono">{createdUser.username}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onCopy(createdUser.username)}
              >
                <Icon name="Copy" size={16} />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Пароль</p>
                <p className="text-lg font-mono">{createdUser.password}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onCopy(createdUser.password)}
              >
                <Icon name="Copy" size={16} />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">User ID</p>
                <p className="text-lg font-mono">{createdUser.user_id}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onCopy(createdUser.user_id.toString())}
              >
                <Icon name="Copy" size={16} />
              </Button>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex gap-2">
              <Icon name="AlertTriangle" className="text-amber-600 flex-shrink-0" size={20} />
              <p className="text-sm text-amber-800">
                Сохраните эти данные в надежном месте. Пароль не будет показан повторно.
              </p>
            </div>
          </div>
          <Button 
            className="w-full" 
            onClick={() => {
              const text = `Логин: ${createdUser.username}\nПароль: ${createdUser.password}\nUser ID: ${createdUser.user_id}`;
              onCopy(text);
            }}
          >
            <Icon name="Copy" className="mr-2" size={16} />
            Скопировать все данные
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
