import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Tenant, Tariff } from './types';
import { useState, useEffect } from 'react';

interface TenantEditDialogProps {
  tenant: Tenant | null;
  tariffs: Tariff[];
  onClose: () => void;
  onSave: () => void;
  onUpdate: (tenant: Tenant) => void;
}

interface ApiKey {
  id: number;
  provider: string;
  key_name: string;
  key_value: string;
  is_active: boolean;
}

export const TenantEditDialog = ({ tenant, tariffs, onClose, onSave, onUpdate }: TenantEditDialogProps) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState({ provider: '', key_name: '', key_value: '' });
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [speechProvider, setSpeechProvider] = useState('yandex');

  useEffect(() => {
    if (tenant) {
      loadApiKeys();
      loadSpeechSettings();
    }
  }, [tenant]);

  const loadApiKeys = async () => {
    if (!tenant) return;
    try {
      const response = await fetch(`https://functions.poehali.dev/10feb3a9-2cd0-4f5f-aebc-8fad7d03e2f9`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list',
          tenant_id: tenant.id
        })
      });
      const data = await response.json();
      if (data.api_keys) {
        setApiKeys(data.api_keys);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  const loadSpeechSettings = async () => {
    if (!tenant) return;
    try {
      const response = await fetch(`https://functions.poehali.dev/66ab8736-2781-4c63-9c2e-09f2061f7c7a`, {
        method: 'GET',
        headers: { 'X-Tenant-Id': tenant.id.toString() }
      });
      const data = await response.json();
      setSpeechEnabled(data.enabled || false);
      setSpeechProvider(data.provider || 'yandex');
    } catch (error) {
      console.error('Failed to load speech settings:', error);
    }
  };

  const addApiKey = async () => {
    if (!tenant || !newKey.provider || !newKey.key_name || !newKey.key_value) return;
    try {
      await fetch(`https://functions.poehali.dev/10feb3a9-2cd0-4f5f-aebc-8fad7d03e2f9`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          tenant_id: tenant.id,
          provider: newKey.provider,
          key_name: newKey.key_name,
          key_value: newKey.key_value
        })
      });
      setNewKey({ provider: '', key_name: '', key_value: '' });
      loadApiKeys();
    } catch (error) {
      console.error('Failed to add API key:', error);
    }
  };

  const deleteApiKey = async (keyId: number) => {
    if (!tenant) return;
    try {
      await fetch(`https://functions.poehali.dev/10feb3a9-2cd0-4f5f-aebc-8fad7d03e2f9`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          tenant_id: tenant.id,
          key_id: keyId
        })
      });
      loadApiKeys();
    } catch (error) {
      console.error('Failed to delete API key:', error);
    }
  };

  const saveSpeechSettings = async () => {
    if (!tenant) return;
    try {
      await fetch(`https://functions.poehali.dev/66ab8736-2781-4c63-9c2e-09f2061f7c7a`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': tenant.id.toString() },
        body: JSON.stringify({
          enabled: speechEnabled,
          provider: speechProvider
        })
      });
    } catch (error) {
      console.error('Failed to save speech settings:', error);
    }
  };

  const handleSave = async () => {
    await saveSpeechSettings();
    onSave();
  };

  if (!tenant) return null;

  return (
    <Dialog open={!!tenant} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Управление клиентом</DialogTitle>
          <DialogDescription>
            Редактирование настроек для {tenant.name}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="general" className="py-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Основное</TabsTrigger>
            <TabsTrigger value="speech">Голос</TabsTrigger>
            <TabsTrigger value="keys">API ключи</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Название</Label>
            <Input value={tenant.name} disabled className="bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={tenant.slug} disabled className="bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tariff">Тариф</Label>
            <Select 
              value={tenant.tariff_id} 
              onValueChange={(value) => onUpdate({...tenant, tariff_id: value})}
            >
              <SelectTrigger id="tariff">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tariffs.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subscription">Подписка до</Label>
            <Input 
              id="subscription"
              type="date" 
              value={tenant.subscription_end_date?.split('T')[0] || ''}
              onChange={(e) => onUpdate({...tenant, subscription_end_date: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
              <div className="flex items-center gap-3">
                <Icon name="ShieldCheck" size={20} className={tenant.fz152_enabled ? 'text-green-600' : 'text-gray-400'} />
                <div>
                  <Label htmlFor="fz152" className="cursor-pointer font-medium">Режим 152-ФЗ</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ограничение на российские модели и обработку данных в РФ
                  </p>
                </div>
              </div>
              <Switch 
                id="fz152"
                checked={tenant.fz152_enabled}
                onCheckedChange={(checked) => onUpdate({...tenant, fz152_enabled: checked})}
              />
            </div>
          </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <Card className="p-3">
                <div className="text-sm text-muted-foreground">Документов</div>
                <div className="text-2xl font-semibold">{tenant.documents_count}</div>
              </Card>
              <Card className="p-3">
                <div className="text-sm text-muted-foreground">Админов</div>
                <div className="text-2xl font-semibold">{tenant.admins_count}</div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="speech" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                <div className="flex items-center gap-3">
                  <Icon name="Mic" size={20} className={speechEnabled ? 'text-blue-600' : 'text-gray-400'} />
                  <div>
                    <Label htmlFor="speech-enabled" className="cursor-pointer font-medium">Распознавание голоса</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Включить обработку голосовых сообщений
                    </p>
                  </div>
                </div>
                <Switch 
                  id="speech-enabled"
                  checked={speechEnabled}
                  onCheckedChange={setSpeechEnabled}
                />
              </div>

              {speechEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="speech-provider">Провайдер распознавания</Label>
                  <Select 
                    value={speechProvider} 
                    onValueChange={setSpeechProvider}
                    disabled={tenant.fz152_enabled}
                  >
                    <SelectTrigger id="speech-provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yandex">
                        <div className="flex items-center gap-2">
                          <Icon name="Globe" size={16} />
                          Yandex SpeechKit
                        </div>
                      </SelectItem>
                      <SelectItem value="openai_whisper">
                        <div className="flex items-center gap-2">
                          <Icon name="Zap" size={16} />
                          OpenAI Whisper
                        </div>
                      </SelectItem>
                      <SelectItem value="google">
                        <div className="flex items-center gap-2">
                          <Icon name="Cloud" size={16} />
                          Google Speech-to-Text
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {tenant.fz152_enabled && (
                    <p className="text-xs text-yellow-600 flex items-center gap-1">
                      <Icon name="AlertCircle" size={14} />
                      При включенном ФЗ-152 автоматически используется Яндекс
                    </p>
                  )}
                </div>
              )}

              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex gap-3">
                  <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm space-y-2">
                    <p className="font-medium text-blue-900">Требуемые API ключи:</p>
                    <ul className="text-blue-700 space-y-1 text-xs">
                      <li>• <strong>Yandex:</strong> YANDEX_SPEECHKIT_API_KEY, YANDEX_FOLDER_ID</li>
                      <li>• <strong>OpenAI:</strong> OPENAI_API_KEY</li>
                      <li>• <strong>Google:</strong> GOOGLE_SPEECH_API_KEY</li>
                    </ul>
                    <p className="text-blue-600 mt-2">Добавьте ключи на вкладке "API ключи"</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="keys" className="space-y-4 mt-4">
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-medium mb-3">Добавить новый ключ</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Провайдер</Label>
                      <Select value={newKey.provider} onValueChange={(v) => setNewKey({...newKey, provider: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yandex">Yandex</SelectItem>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="google">Google</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Название ключа</Label>
                      <Input 
                        placeholder="YANDEX_SPEECHKIT_API_KEY"
                        value={newKey.key_name}
                        onChange={(e) => setNewKey({...newKey, key_name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Значение ключа</Label>
                    <Input 
                      type="password"
                      placeholder="Введите API ключ"
                      value={newKey.key_value}
                      onChange={(e) => setNewKey({...newKey, key_value: e.target.value})}
                    />
                  </div>
                  <Button onClick={addApiKey} className="w-full">
                    <Icon name="Plus" size={16} className="mr-2" />
                    Добавить ключ
                  </Button>
                </div>
              </Card>

              <div className="space-y-2">
                <h3 className="font-medium">Существующие ключи</h3>
                {apiKeys.length === 0 ? (
                  <Card className="p-4 text-center text-muted-foreground">
                    <Icon name="Key" size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">API ключи не добавлены</p>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {apiKeys.map(key => (
                      <Card key={key.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{key.key_name}</span>
                              <Badge variant="outline" className="text-xs">{key.provider}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">•••••••••••••</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteApiKey(key.id)}
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            Сохранить изменения
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};