import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { authenticatedFetch, getTenantId } from '@/lib/auth';
import { BACKEND_URLS } from './types';

interface FormattingSettings {
  messenger: string;
  use_emoji: boolean;
  use_markdown: boolean;
  use_lists_formatting: boolean;
}

const MESSENGERS = [
  { id: 'telegram', label: 'Telegram', icon: 'Send' },
  { id: 'vk', label: 'VK', icon: 'Users' },
  { id: 'max', label: 'MAX', icon: 'Mail' }
];

const FormattingSettingsCard = () => {
  const { toast } = useToast();
  const tenantId = getTenantId();
  const [settings, setSettings] = useState<Record<string, FormattingSettings>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('telegram');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await authenticatedFetch(
        `${BACKEND_URLS.manageFormattingSettings}?tenant_id=${tenantId}`
      );
      const data = await response.json();
      
      if (data.settings) {
        const settingsMap: Record<string, FormattingSettings> = {};
        data.settings.forEach((s: FormattingSettings) => {
          settingsMap[s.messenger] = s;
        });
        setSettings(settingsMap);
      }
    } catch (error) {
      console.error('Error loading formatting settings:', error);
    }
  };

  const handleToggle = (messenger: string, field: keyof Omit<FormattingSettings, 'messenger'>) => {
    setSettings(prev => ({
      ...prev,
      [messenger]: {
        ...prev[messenger],
        [field]: !prev[messenger]?.[field]
      }
    }));
  };

  const handleSave = async (messenger: string) => {
    setIsLoading(true);
    try {
      const config = settings[messenger] || {
        messenger,
        use_emoji: true,
        use_markdown: true,
        use_lists_formatting: true
      };

      await authenticatedFetch(
        `${BACKEND_URLS.manageFormattingSettings}?tenant_id=${tenantId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messenger,
            ...config
          })
        }
      );

      toast({
        title: 'Сохранено',
        description: `Настройки форматирования для ${MESSENGERS.find(m => m.id === messenger)?.label} обновлены`
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось сохранить настройки',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessengerSettings = (messenger: string) => {
    const config = settings[messenger] || {
      messenger,
      use_emoji: true,
      use_markdown: true,
      use_lists_formatting: true
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <Label htmlFor={`${messenger}-emoji`} className="text-base font-medium">
              Использовать эмодзи
            </Label>
            <p className="text-sm text-slate-500">
              AI будет добавлять эмодзи для улучшения восприятия
            </p>
          </div>
          <Switch
            id={`${messenger}-emoji`}
            checked={config.use_emoji}
            onCheckedChange={() => handleToggle(messenger, 'use_emoji')}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <Label htmlFor={`${messenger}-markdown`} className="text-base font-medium">
              Использовать Markdown
            </Label>
            <p className="text-sm text-slate-500">
              Жирный текст, курсив, подчеркивание для выделения
            </p>
          </div>
          <Switch
            id={`${messenger}-markdown`}
            checked={config.use_markdown}
            onCheckedChange={() => handleToggle(messenger, 'use_markdown')}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <Label htmlFor={`${messenger}-lists`} className="text-base font-medium">
              Форматировать списки
            </Label>
            <p className="text-sm text-slate-500">
              Структурированные списки с маркерами и нумерацией
            </p>
          </div>
          <Switch
            id={`${messenger}-lists`}
            checked={config.use_lists_formatting}
            onCheckedChange={() => handleToggle(messenger, 'use_lists_formatting')}
          />
        </div>

        <Button
          onClick={() => handleSave(messenger)}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить настройки
            </>
          )}
        </Button>
      </div>
    );
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <Icon name="Settings" size={20} />
          Форматирование сообщений
        </CardTitle>
        <CardDescription>
          Настройте стиль ответов AI для каждого мессенджера
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            {MESSENGERS.map((messenger) => (
              <TabsTrigger key={messenger.id} value={messenger.id}>
                <Icon name={messenger.icon as any} size={16} className="mr-2" />
                {messenger.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {MESSENGERS.map((messenger) => (
            <TabsContent key={messenger.id} value={messenger.id} className="space-y-4 mt-4">
              {renderMessengerSettings(messenger.id)}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FormattingSettingsCard;
