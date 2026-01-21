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
  fz152Enabled?: boolean;
}

interface ApiKey {
  provider: 'yandex' | 'openrouter' | 'proxyapi';
  key_name: string;
  key_value: string;
  is_active: boolean;
}

const TenantApiKeysCard = ({ tenantId, tenantName, fz152Enabled = false }: TenantApiKeysCardProps) => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [yandexApiKey, setYandexApiKey] = useState('');
  const [yandexFolderId, setYandexFolderId] = useState('');
  const [openrouterApiKey, setOpenrouterApiKey] = useState('');
  const [proxyapiApiKey, setProxyapiApiKey] = useState('');

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
        const proxyapiApi = data.keys.find((k: ApiKey) => k.provider === 'proxyapi' && k.key_name === 'api_key');
        
        setYandexApiKey(yandexApi?.key_value || '');
        setYandexFolderId(yandexFolder?.key_value || '');
        setOpenrouterApiKey(openrouterApi?.key_value || '');
        setProxyapiApiKey(proxyapiApi?.key_value || '');
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
      
      if (yandexApiKey.trim() && !yandexApiKey.startsWith('***')) {
        keysToSave.push({ provider: 'yandex', key_name: 'api_key', key_value: yandexApiKey.trim() });
      }
      if (yandexFolderId.trim() && !yandexFolderId.startsWith('***')) {
        keysToSave.push({ provider: 'yandex', key_name: 'folder_id', key_value: yandexFolderId.trim() });
      }
      if (openrouterApiKey.trim() && !openrouterApiKey.startsWith('***')) {
        keysToSave.push({ provider: 'openrouter', key_name: 'api_key', key_value: openrouterApiKey.trim() });
      }
      if (proxyapiApiKey.trim() && !proxyapiApiKey.startsWith('***')) {
        keysToSave.push({ provider: 'proxyapi', key_name: 'api_key', key_value: proxyapiApiKey.trim() });
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
          {fz152Enabled 
            ? `Для соблюдения 152-ФЗ необходимо использовать собственный API ключ YandexGPT для ${tenantName}` 
            : `Управление ключами для ${tenantName}. Каждый бот использует свои ключи.`}
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
              {fz152Enabled && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Icon name="ShieldCheck" size={16} className="text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-900">
                      <p className="font-semibold mb-2">Требования 152-ФЗ</p>
                      <p className="text-amber-800 mb-1">
                        Для обработки персональных данных клиентов необходимо использовать собственный API ключ YandexGPT.
                      </p>
                      <p className="text-amber-800">
                        Это обеспечивает соответствие законодательству о защите персональных данных.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Яндекс API</p>
                    <p className="text-blue-800">
                      {fz152Enabled 
                        ? 'Используется для чата (YandexGPT Lite) и эмбеддингов (text-search-doc, text-search-query)'
                        : 'Используется моделью YandexGPT и для эмбеддингов всех OpenRouter моделей'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="yandex_api_key" className="flex items-center gap-2">
                    Yandex API Key
                    {yandexApiKey && !yandexApiKey.startsWith('***') && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Icon name="CheckCircle2" size={12} />
                        Настроен
                      </span>
                    )}
                    {(!yandexApiKey || yandexApiKey.startsWith('***')) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        <Icon name="CircleDashed" size={12} />
                        Не настроен
                      </span>
                    )}
                  </Label>
                  <Input
                    id="yandex_api_key"
                    type="password"
                    value={yandexApiKey.startsWith('***') ? '' : yandexApiKey}
                    onChange={(e) => setYandexApiKey(e.target.value)}
                    placeholder="AQVN... (введите новый ключ)"
                    className="font-mono text-sm"
                  />
                  {yandexApiKey && !yandexApiKey.startsWith('***') && (
                    <p className="text-xs text-muted-foreground">
                      Текущий: {maskKey(yandexApiKey)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yandex_folder_id" className="flex items-center gap-2">
                    Yandex Folder ID
                    {yandexFolderId && !yandexFolderId.startsWith('***') && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Icon name="CheckCircle2" size={12} />
                        Настроен
                      </span>
                    )}
                    {(!yandexFolderId || yandexFolderId.startsWith('***')) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        <Icon name="CircleDashed" size={12} />
                        Не настроен
                      </span>
                    )}
                  </Label>
                  <Input
                    id="yandex_folder_id"
                    type="text"
                    value={yandexFolderId.startsWith('***') ? '' : yandexFolderId}
                    onChange={(e) => setYandexFolderId(e.target.value)}
                    placeholder="b1g... (введите новый ID)"
                    className="font-mono text-sm"
                  />
                  {yandexFolderId && !yandexFolderId.startsWith('***') && (
                    <p className="text-xs text-muted-foreground">
                      Текущий: {maskKey(yandexFolderId)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {!fz152Enabled && (
            <>
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Icon name="Info" size={16} className="text-purple-600 mt-0.5" />
                  <div className="text-sm text-purple-900">
                    <p className="font-medium mb-1">OpenRouter API</p>
                    <p className="text-purple-800 mb-2">
                      <strong>Бесплатные:</strong> Meta Llama 3.1 8B, Google Gemma 2 9B, Qwen 2.5 7B, Microsoft Phi-3 Medium, DeepSeek R1
                    </p>
                    <p className="text-purple-800">
                      <strong>Платные:</strong> GPT-4o, Claude 3.5 Sonnet, GPT-3.5 Turbo, Claude 3 Haiku, Gemini Flash и другие топовые модели
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="openrouter_api_key" className="flex items-center gap-2">
                  OpenRouter API Key
                  {openrouterApiKey && !openrouterApiKey.startsWith('***') && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Icon name="CheckCircle2" size={12} />
                      Настроен
                    </span>
                  )}
                  {(!openrouterApiKey || openrouterApiKey.startsWith('***')) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      <Icon name="CircleDashed" size={12} />
                      Не настроен
                    </span>
                  )}
                </Label>
                <Input
                  id="openrouter_api_key"
                  type="password"
                  value={openrouterApiKey.startsWith('***') ? '' : openrouterApiKey}
                  onChange={(e) => setOpenrouterApiKey(e.target.value)}
                  placeholder="sk-or-... (введите новый ключ)"
                  className="font-mono text-sm"
                />
                {openrouterApiKey && !openrouterApiKey.startsWith('***') && (
                  <p className="text-xs text-muted-foreground">
                    Текущий: {maskKey(openrouterApiKey)}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Icon name="Info" size={16} className="text-emerald-600 mt-0.5" />
                  <div className="text-sm text-emerald-900">
                    <p className="font-medium mb-1">ProxyAPI</p>
                    <p className="text-emerald-800 mb-2">
                      <strong>Доступные модели:</strong> GPT-4o Mini, O1 Mini, O1, Claude 3 Haiku, Claude 3.5 Sonnet, Claude 3 Opus
                    </p>
                    <p className="text-emerald-800">
                      Российский API-прокси для доступа к моделям OpenAI и Anthropic
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proxyapi_api_key" className="flex items-center gap-2">
                  ProxyAPI Key
                  {proxyapiApiKey && !proxyapiApiKey.startsWith('***') && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Icon name="CheckCircle2" size={12} />
                      Настроен
                    </span>
                  )}
                  {(!proxyapiApiKey || proxyapiApiKey.startsWith('***')) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      <Icon name="CircleDashed" size={12} />
                      Не настроен
                    </span>
                  )}
                </Label>
                <Input
                  id="proxyapi_api_key"
                  type="password"
                  value={proxyapiApiKey.startsWith('***') ? '' : proxyapiApiKey}
                  onChange={(e) => setProxyapiApiKey(e.target.value)}
                  placeholder="sk-... (введите новый ключ)"
                  className="font-mono text-sm"
                />
                {proxyapiApiKey && !proxyapiApiKey.startsWith('***') && (
                  <p className="text-xs text-muted-foreground">
                    Текущий: {maskKey(proxyapiApiKey)}
                  </p>
                )}
              </div>
            </div>
            </>
            )}

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