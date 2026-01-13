import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TenantCreationForm } from './TenantCreationForm';
import { SuccessCredentialsDialog } from './SuccessCredentialsDialog';

const BACKEND_URL = 'https://functions.poehali.dev/2163d682-19a2-462b-b577-7f04219cc3c8';

interface NewTenant {
  slug: string;
  name: string;
  description: string;
  owner_email: string;
  owner_phone: string;
}

interface CreatedUser {
  user_id: number;
  username: string;
  password: string;
  email_sent: boolean;
}

const CreateTenantWithUserPanel = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<NewTenant>({
    slug: '',
    name: '',
    description: '',
    owner_email: '',
    owner_phone: ''
  });

  const handleCreate = async () => {
    if (!formData.slug || !formData.name || !formData.owner_email) {
      toast({ 
        title: 'Ошибка', 
        description: 'Заполните обязательные поля: slug, название и email',
        variant: 'destructive' 
      });
      return;
    }

    setIsCreating(true);
    try {
      const tenantResponse = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!tenantResponse.ok) {
        const error = await tenantResponse.json();
        throw new Error(error.error || 'Не удалось создать тенант');
      }

      const tenantData = await tenantResponse.json();
      const tenantId = tenantData.tenant_id;

      const userResponse = await fetch(`${BACKEND_URL}?action=create_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          email: formData.owner_email
        })
      });

      if (!userResponse.ok) {
        const error = await userResponse.json();
        throw new Error(error.error || 'Не удалось создать пользователя');
      }

      const userData = await userResponse.json();
      
      setCreatedUser({
        user_id: userData.user_id,
        username: userData.username,
        password: userData.password,
        email_sent: userData.email_sent
      });

      setShowSuccessDialog(true);
      
      setFormData({
        slug: '',
        name: '',
        description: '',
        owner_email: '',
        owner_phone: ''
      });

      toast({ 
        title: 'Успешно', 
        description: `Тенант и пользователь созданы. Email ${userData.email_sent ? 'отправлен' : 'не отправлен'}` 
      });

    } catch (error: any) {
      toast({ 
        title: 'Ошибка', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Скопировано', description: 'Данные скопированы в буфер обмена' });
  };

  return (
    <>
      <TenantCreationForm
        formData={formData}
        isCreating={isCreating}
        onChange={setFormData}
        onSubmit={handleCreate}
      />

      <SuccessCredentialsDialog
        open={showSuccessDialog}
        createdUser={createdUser}
        onOpenChange={setShowSuccessDialog}
        onCopy={copyToClipboard}
      />
    </>
  );
};

export default CreateTenantWithUserPanel;
