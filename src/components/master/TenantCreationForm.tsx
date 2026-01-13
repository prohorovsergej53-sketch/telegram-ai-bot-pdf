import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface NewTenant {
  slug: string;
  name: string;
  description: string;
  owner_email: string;
  owner_phone: string;
}

interface TenantCreationFormProps {
  formData: NewTenant;
  isCreating: boolean;
  onChange: (formData: NewTenant) => void;
  onSubmit: () => void;
}

export const TenantCreationForm = ({
  formData,
  isCreating,
  onChange,
  onSubmit
}: TenantCreationFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Создать новую пару (тенант + пользователь)</CardTitle>
        <CardDescription>
          Создается тенант и пользователь-редактор контента. Email с доступами отправляется автоматически.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="slug">Slug (URL) *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => onChange({ ...formData, slug: e.target.value })}
              placeholder="hotel-pushkin"
            />
          </div>
          <div>
            <Label htmlFor="name">Название *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              placeholder="Отель Пушкин"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Описание</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onChange({ ...formData, description: e.target.value })}
            placeholder="AI-консьерж для отеля"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="owner_email">Email владельца *</Label>
            <Input
              id="owner_email"
              type="email"
              value={formData.owner_email}
              onChange={(e) => onChange({ ...formData, owner_email: e.target.value })}
              placeholder="owner@example.com"
            />
          </div>
          <div>
            <Label htmlFor="owner_phone">Телефон</Label>
            <Input
              id="owner_phone"
              value={formData.owner_phone}
              onChange={(e) => onChange({ ...formData, owner_phone: e.target.value })}
              placeholder="+7 (999) 123-45-67"
            />
          </div>
        </div>

        <Button onClick={onSubmit} disabled={isCreating} className="w-full">
          {isCreating ? (
            <>
              <Icon name="Loader2" className="animate-spin mr-2" size={16} />
              Создание...
            </>
          ) : (
            <>
              <Icon name="Plus" className="mr-2" size={16} />
              Создать тенант + пользователя
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
