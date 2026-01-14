import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { authenticatedFetch } from '@/lib/auth';
import FUNC_URLS from '../../../backend/func2url.json';

const BACKEND_URL = FUNC_URLS['manage-api-keys'];

interface TenantApiKeysCardProps {
  tenantId: number;
  tenantName: string;
}

interface ApiKey {
  provider: 'yandex' | 'openrouter';
  key_name: string;
  key_value: string;
  is_active: boolean;
}

const TenantApiKeysCard = ({ tenantId, tenantName }: TenantApiKeysCardProps) => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [yandexApiKey, setYandexApiKey] = useState('');
  const [yandexFolderId, setYandexFolderId] = useState('');
  const [openrouterApiKey, setOpenrouterApiKey] = useState('');

  useEffect(() => {
    loadKeys();
  }, [tenantId]);

  const loadKeys = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(`${BACKEND_URL}?tenant_id=${tenantId}`, {
        method: 'GET'
      });
      const data = await response.json();
      
      if (response.ok && data.keys) {
        setKeys(data.keys);
        
        const yandexApi = data.keys.find((k: ApiKey) => k.provider === 'yandex' && k.key_name === 'api_key');
        const yandexFolder = data.keys.find((k: ApiKey) => k.provider === 'yandex' && k.key_name === 'folder_id');
        const openrouterApi = data.keys.find((k: ApiKey) => k.provider === 'openrouter' && k.key_name === 'api_key');
        
        setYandexApiKey(yandexApi?.key_value || '');
        setYandexFolderId(yandexFolder?.key_value || '');
        setOpenrouterApiKey(openrouterApi?.key_value || '');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось загрузить ключи',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const keysToSave: Array<{provider: string, key_name: string, key_value: string}> = [];
      
      if (yandexApiKey.trim()) {
        keysToSave.push({ provider: 'yandex', key_name: 'api_key', key_value: yandexApiKey.trim() });
      }
      if (yandexFolderId.trim()) {
        keysToSave.push({ provider: 'yandex', key_name: 'folder_id', key_value: yandexFolderId.trim() });
      }
      if (openrouterApiKey.trim()) {
        keysToSave.push({ provider: 'openrouter', key_name: 'api_key', key_value: openrouterApiKey.trim() });
      }

      if (keysToSave.length === 0) {
        toast({
          title: 'Внимание',
          description: 'Заполните хотя бы один ключ',
          variant: 'default'
        });
        return;
      }

      const response = await authenticatedFetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          keys: keysToSave
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: data.message || 'Ключи сохранены'
        });
        await loadKeys();
      } else {
        throw new Error(data.error || 'Не удалось сохранить ключи');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const maskKey = (key: string) => {
    if (!key || key.length < 8) return '••••••••';
    return key.substring(0, 4) + '••••' + key.substring(key.length - 4);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Key" size={20} />
          API ключи бота
        </CardTitle>
        <CardDescription>
          Управление ключами для {tenantName}. Каждый бот использует свои ключи.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader2" size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Яндекс API</p>
                    <p className="text-blue-800">
                      Используется моделью YandexGPT и для эмбеддингов всех OpenRouter моделей
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="yandex_api_key">Yandex API Key</Label>
                  <Input
                    id="yandex_api_key"
                    type="password"
                    value={yandexApiKey}
                    onChange={(e) => setYandexApiKey(e.target.value)}
                    placeholder="AQVN..."
                    className="font-mono text-sm"
                  />
                  {yandexApiKey && (
                    <p className="text-xs text-muted-foreground">
                      Текущий: {maskKey(yandexApiKey)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yandex_folder_id">Yandex Folder ID</Label>
                  <Input
                    id="yandex_folder_id"
                    type="text"
                    value={yandexFolderId}
                    onChange={(e) => setYandexFolderId(e.target.value)}
                    placeholder="b1g..."
                    className="font-mono text-sm"
                  />
                  {yandexFolderId && (
                    <p className="text-xs text-muted-foreground">
                      Текущий: {maskKey(yandexFolderId)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Icon name="Info" size={16} className="text-purple-600 mt-0.5" />
                  <div className="text-sm text-purple-900">
                    <p className="font-medium mb-1">OpenRouter API</p>
                    <p className="text-purple-800">
                      Используется для моделей: Llama 3.1, Gemma 2, Qwen 2.5, Phi-3, DeepSeek R1
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="openrouter_api_key">OpenRouter API Key</Label>
                <Input
                  id="openrouter_api_key"
                  type="password"
                  value={openrouterApiKey}
                  onChange={(e) => setOpenrouterApiKey(e.target.value)}
                  placeholder="sk-or-..."
                  className="font-mono text-sm"
                />
                {openrouterApiKey && (
                  <p className="text-xs text-muted-foreground">
                    Текущий: {maskKey(openrouterApiKey)}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Icon name="AlertTriangle" size={16} className="text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-medium mb-1">Важно:</p>
                  <ul className="list-disc list-inside text-amber-800 space-y-1">
                    <li>Для работы YandexGPT нужны оба ключа Яндекса</li>
                    <li>Для работы OpenRouter моделей нужны: OpenRouter API key + оба ключа Яндекса (для эмбеддингов)</li>
                    <li>Ключи хранятся в зашифрованном виде</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить ключи
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TenantApiKeysCard;
