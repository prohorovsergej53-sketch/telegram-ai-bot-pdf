import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const BACKEND_URL = 'https://functions.poehali.dev/2163d682-19a2-462b-b577-7f04219cc3c8';

interface SettingValue {
  value: string;
  description: string;
  updated_at: string | null;
}

interface Settings {
  [key: string]: SettingValue;
}

const DefaultSettingsPanel = () => {
  const [settings, setSettings] = useState<Settings>({});
  const [editedSettings, setEditedSettings] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}?action=default_settings`);
      const data = await response.json();
      setSettings(data.settings || {});
      
      const edited: { [key: string]: string } = {};
      Object.keys(data.settings || {}).forEach(key => {
        edited[key] = data.settings[key].value;
      });
      setEditedSettings(edited);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить настройки', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (settingKey: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}?action=default_settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setting_key: settingKey,
          setting_value: editedSettings[settingKey]
        })
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'Настройка сохранена' });
        loadSettings();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const settingLabels: { [key: string]: string } = {
    'default_system_prompt': 'Дефолтный системный промпт',
    'email_template_welcome': 'Шаблон письма приветствия',
    'smtp_host': 'SMTP сервер',
    'smtp_port': 'SMTP порт',
    'smtp_user': 'SMTP пользователь (email)',
    'smtp_password': 'SMTP пароль приложения',
    'yookassa_shop_id': 'ЮKassa Shop ID',
    'yookassa_secret_key': 'ЮKassa Secret Key'
  };

  const settingCategories: { [key: string]: string } = {
    'default_system_prompt': 'prompts',
    'email_template_welcome': 'prompts',
    'smtp_host': 'smtp',
    'smtp_port': 'smtp',
    'smtp_user': 'smtp',
    'smtp_password': 'smtp',
    'yookassa_shop_id': 'yookassa',
    'yookassa_secret_key': 'yookassa'
  };

  const isSmallInput = (key: string) => ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'yookassa_shop_id', 'yookassa_secret_key'].includes(key);

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
        <h2 className="text-2xl font-bold">Дефолтные настройки</h2>
        <p className="text-muted-foreground">
          Эти настройки будут использоваться для всех новых тенантов
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">📝 Промпты и шаблоны</h3>
        <div className="space-y-6">
          {Object.keys(settings).filter(key => settingCategories[key] === 'prompts').map(key => (
            <Card key={key}>
              <CardHeader>
                <CardTitle>{settingLabels[key] || key}</CardTitle>
                <CardDescription>{settings[key].description}</CardDescription>
                {settings[key].updated_at && (
                  <p className="text-xs text-muted-foreground">
                    Обновлено: {new Date(settings[key].updated_at).toLocaleString('ru-RU')}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor={key}>Значение</Label>
                  <Textarea
                    id={key}
                    value={editedSettings[key] || ''}
                    onChange={(e) => setEditedSettings({ ...editedSettings, [key]: e.target.value })}
                    rows={key === 'default_system_prompt' ? 15 : 8}
                    className="font-mono text-sm"
                  />
                </div>
                <Button
                  onClick={() => handleSave(key)}
                  disabled={isSaving || editedSettings[key] === settings[key].value}
                >
                  {isSaving ? (
                    <>
                      <Icon name="Loader2" className="animate-spin mr-2" size={16} />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Icon name="Save" className="mr-2" size={16} />
                      Сохранить
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">📧 SMTP настройки</h3>
        <Card>
          <CardHeader>
            <CardTitle>Email для отправки писем</CardTitle>
            <CardDescription>
              Настройте SMTP для автоматической отправки паролей новым пользователям
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(settings).filter(key => settingCategories[key] === 'smtp').map(key => (
              <div key={key}>
                <Label htmlFor={key}>{settingLabels[key] || key}</Label>
                <Input
                  id={key}
                  type={key === 'smtp_password' ? 'password' : key === 'smtp_port' ? 'number' : 'text'}
                  value={editedSettings[key] || ''}
                  onChange={(e) => setEditedSettings({ ...editedSettings, [key]: e.target.value })}
                  placeholder={key === 'smtp_host' ? 'smtp.yandex.ru' : key === 'smtp_port' ? '465' : ''}
                  className="font-mono"
                />
              </div>
            ))}
            <Button
              onClick={() => {
                ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_password'].forEach(key => handleSave(key));
              }}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Icon name="Loader2" className="animate-spin mr-2" size={16} />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" className="mr-2" size={16} />
                  Сохранить SMTP настройки
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">💳 ЮKassa настройки</h3>
        <Card>
          <CardHeader>
            <CardTitle>Интеграция с платежной системой</CardTitle>
            <CardDescription>
              Настройте ЮKassa для приема платежей за подписку
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(settings).filter(key => settingCategories[key] === 'yookassa').map(key => (
              <div key={key}>
                <Label htmlFor={key}>{settingLabels[key] || key}</Label>
                <Input
                  id={key}
                  type={key === 'yookassa_secret_key' ? 'password' : 'text'}
                  value={editedSettings[key] || ''}
                  onChange={(e) => setEditedSettings({ ...editedSettings, [key]: e.target.value })}
                  placeholder={key === 'yookassa_shop_id' ? '123456' : 'live_xxxxx или test_xxxxx'}
                  className="font-mono"
                />
              </div>
            ))}
            <Button
              onClick={() => {
                ['yookassa_shop_id', 'yookassa_secret_key'].forEach(key => handleSave(key));
              }}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Icon name="Loader2" className="animate-spin mr-2" size={16} />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" className="mr-2" size={16} />
                  Сохранить ЮKassa настройки
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DefaultSettingsPanel;