import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { authenticatedFetch } from '@/lib/auth';
import { BACKEND_URLS } from '@/components/hotel/types';

interface FormattingSettings {
  tenant_id: number;
  tenant_name: string;
  messenger: string;
  use_emoji: boolean;
  use_markdown: boolean;
  use_lists_formatting: boolean;
  custom_emoji_map: Record<string, string>;
  list_bullet_char: string;
  numbered_list_char: string;
}

interface Tenant {
  id: number;
  name: string;
  slug: string;
}

export default function FormattingTab() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);
  const [settings, setSettings] = useState<FormattingSettings[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customEmojiText, setCustomEmojiText] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      loadSettings(selectedTenant);
    }
  }, [selectedTenant]);

  const loadTenants = async () => {
    try {
      const response = await authenticatedFetch(`${BACKEND_URLS.adminTenants}?action=list`);
      const data = await response.json();
      setTenants(data.tenants || []);
      if (data.tenants?.length > 0) {
        setSelectedTenant(data.tenants[0].id);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список тенантов',
        variant: 'destructive'
      });
    }
  };

  const loadSettings = async (tenantId: number) => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(`${BACKEND_URLS.formattingSettings}?tenant_id=${tenantId}`);
      const data = await response.json();
      setSettings(data.settings || []);
      
      // Формируем текст для кастомных эмодзи
      if (data.settings?.length > 0) {
        const firstSetting = data.settings[0];
        setCustomEmojiText(JSON.stringify(firstSetting.custom_emoji_map || {}, null, 2));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить настройки форматирования',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (messenger: string, updates: Partial<FormattingSettings>) => {
    if (!selectedTenant) return;

    try {
      const currentSetting = settings.find(s => s.messenger === messenger);
      if (!currentSetting) return;

      const payload = {
        messenger,
        use_emoji: updates.use_emoji ?? currentSetting.use_emoji,
        use_markdown: updates.use_markdown ?? currentSetting.use_markdown,
        use_lists_formatting: updates.use_lists_formatting ?? currentSetting.use_lists_formatting,
        custom_emoji_map: updates.custom_emoji_map ?? currentSetting.custom_emoji_map,
        list_bullet_char: updates.list_bullet_char ?? currentSetting.list_bullet_char,
        numbered_list_char: updates.numbered_list_char ?? currentSetting.numbered_list_char
      };

      await authenticatedFetch(`${BACKEND_URLS.formattingSettings}?tenant_id=${selectedTenant}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      toast({
        title: 'Сохранено',
        description: `Настройки для ${messenger} обновлены`
      });

      loadSettings(selectedTenant);
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive'
      });
    }
  };

  const saveCustomEmoji = async (messenger: string) => {
    try {
      const emojiMap = JSON.parse(customEmojiText);
      await updateSetting(messenger, { custom_emoji_map: emojiMap });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Неверный формат JSON',
        variant: 'destructive'
      });
    }
  };

  const renderMessengerSettings = (messenger: string, setting: FormattingSettings) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name={messenger === 'telegram' ? 'Send' : messenger === 'max' ? 'MessageCircle' : 'MessageSquare'} size={20} />
          {messenger === 'telegram' ? 'Telegram' : messenger === 'max' ? 'MAX' : 'VK'}
        </CardTitle>
        <CardDescription>
          Настройки форматирования сообщений для {messenger}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor={`${messenger}-emoji`}>Использовать эмодзи</Label>
          <Switch
            id={`${messenger}-emoji`}
            checked={setting.use_emoji}
            onCheckedChange={(checked) => updateSetting(messenger, { use_emoji: checked })}
          />
        </div>

        {messenger === 'telegram' && (
          <div className="flex items-center justify-between">
            <Label htmlFor={`${messenger}-markdown`}>Markdown форматирование</Label>
            <Switch
              id={`${messenger}-markdown`}
              checked={setting.use_markdown}
              onCheckedChange={(checked) => updateSetting(messenger, { use_markdown: checked })}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label htmlFor={`${messenger}-lists`}>Форматирование списков</Label>
          <Switch
            id={`${messenger}-lists`}
            checked={setting.use_lists_formatting}
            onCheckedChange={(checked) => updateSetting(messenger, { use_lists_formatting: checked })}
          />
        </div>

        <div className="space-y-2">
          <Label>Символ для маркированных списков</Label>
          <Input
            value={setting.list_bullet_char}
            onChange={(e) => updateSetting(messenger, { list_bullet_char: e.target.value })}
            placeholder="•"
            maxLength={5}
          />
        </div>

        <div className="space-y-2">
          <Label>Символ для нумерованных списков</Label>
          <Input
            value={setting.numbered_list_char}
            onChange={(e) => updateSetting(messenger, { numbered_list_char: e.target.value })}
            placeholder="▫️"
            maxLength={5}
          />
        </div>

        <div className="space-y-2">
          <Label>Кастомные эмодзи (JSON)</Label>
          <Textarea
            value={customEmojiText}
            onChange={(e) => setCustomEmojiText(e.target.value)}
            placeholder='{"номер": "🏨", "завтрак": "🍳"}'
            rows={6}
            className="font-mono text-sm"
          />
          <Button onClick={() => saveCustomEmoji(messenger)} size="sm">
            Сохранить эмодзи
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Icon name="Loader2" className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Форматирование сообщений</h2>
          <p className="text-muted-foreground">
            Настройки форматирования для каждого мессенджера
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Label>Выберите тенанта</Label>
        <Select value={selectedTenant?.toString()} onValueChange={(val) => setSelectedTenant(parseInt(val))}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите тенанта" />
          </SelectTrigger>
          <SelectContent>
            {tenants.map(tenant => (
              <SelectItem key={tenant.id} value={tenant.id.toString()}>
                {tenant.name} ({tenant.slug})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTenant && settings.length > 0 && (
        <Tabs defaultValue="telegram">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="telegram">Telegram</TabsTrigger>
            <TabsTrigger value="max">MAX</TabsTrigger>
            <TabsTrigger value="vk">VK</TabsTrigger>
          </TabsList>

          <TabsContent value="telegram">
            {settings.find(s => s.messenger === 'telegram') &&
              renderMessengerSettings('telegram', settings.find(s => s.messenger === 'telegram')!)}
          </TabsContent>

          <TabsContent value="max">
            {settings.find(s => s.messenger === 'max') &&
              renderMessengerSettings('max', settings.find(s => s.messenger === 'max')!)}
          </TabsContent>

          <TabsContent value="vk">
            {settings.find(s => s.messenger === 'vk') &&
              renderMessengerSettings('vk', settings.find(s => s.messenger === 'vk')!)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
