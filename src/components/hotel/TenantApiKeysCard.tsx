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
  provider: 'yandex' | 'deepseek' | 'openrouter' | 'proxyapi' | 'openai' | 'google';
  key_name: string;
  key_value: string;
  is_active: boolean;
}

const TenantApiKeysCard = ({ tenantId, tenantName, fz152Enabled = false }: TenantApiKeysCardProps) => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const { toast } = useToast();

  const [yandexApiKey, setYandexApiKey] = useState('');
  const [yandexFolderId, setYandexFolderId] = useState('');
  const [yandexSpeechApiKey, setYandexSpeechApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [googleSpeechApiKey, setGoogleSpeechApiKey] = useState('');
  const [deepseekApiKey, setDeepseekApiKey] = useState('');
  const [openrouterApiKey, setOpenrouterApiKey] = useState('');
  const [proxyapiApiKey, setProxyapiApiKey] = useState('');

  useEffect(() => {
    loadKeys();
  }, [tenantId]);

  const loadKeys = async () => {
    setIsLoading(true);
    try {
      console.log('[TenantApiKeysCard] Loading keys for tenant:', tenantId);
      const response = await authenticatedFetch(`${BACKEND_URL}?tenant_id=${tenantId}`, {
        method: 'GET'
      });
      const data = await response.json();
      console.log('[TenantApiKeysCard] Keys response:', data);
      
      if (response.ok && data.keys) {
        setKeys(data.keys);
        
        const yandexApi = data.keys.find((k: ApiKey) => k.provider === 'yandex' && k.key_name === 'api_key');
        const yandexFolder = data.keys.find((k: ApiKey) => k.provider === 'yandex' && k.key_name === 'folder_id');
        const yandexSpeech = data.keys.find((k: ApiKey) => k.provider === 'yandex' && k.key_name === 'YANDEX_SPEECHKIT_API_KEY');
        const openaiApi = data.keys.find((k: ApiKey) => k.provider === 'openai' && k.key_name === 'OPENAI_API_KEY');
        const googleSpeech = data.keys.find((k: ApiKey) => k.provider === 'google' && k.key_name === 'GOOGLE_SPEECH_API_KEY');
        const deepseekApi = data.keys.find((k: ApiKey) => k.provider === 'deepseek' && k.key_name === 'api_key');
        const openrouterApi = data.keys.find((k: ApiKey) => k.provider === 'openrouter' && k.key_name === 'api_key');
        const proxyapiApi = data.keys.find((k: ApiKey) => k.provider === 'proxyapi' && k.key_name === 'api_key');
        
        console.log('[TenantApiKeysCard] Found keys:', {
          yandex: !!yandexApi,
          yandexSpeech: !!yandexSpeech,
          openai: !!openaiApi,
          googleSpeech: !!googleSpeech,
          deepseek: !!deepseekApi,
          openrouter: !!openrouterApi,
          proxyapi: !!proxyapiApi
        });
        
        setYandexApiKey(yandexApi?.key_value || '');
        setYandexFolderId(yandexFolder?.key_value || '');
        setYandexSpeechApiKey(yandexSpeech?.key_value || '');
        setOpenaiApiKey(openaiApi?.key_value || '');
        setGoogleSpeechApiKey(googleSpeech?.key_value || '');
        setDeepseekApiKey(deepseekApi?.key_value || '');
        setOpenrouterApiKey(openrouterApi?.key_value || '');
        setProxyapiApiKey(proxyapiApi?.key_value || '');
      } else {
        console.error('[TenantApiKeysCard] Failed to load keys:', response.status, data);
      }
    } catch (error: any) {
      console.error('[TenantApiKeysCard] Error loading keys:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось загрузить ключи',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKey = async (provider: string, keyName: string, keyValue: string, savingId: string) => {
    if (!keyValue.trim() || keyValue.startsWith('***')) {
      toast({
        title: 'Внимание',
        description: 'Введите новый ключ для сохранения',
        variant: 'default'
      });
      return;
    }

    setSavingKey(savingId);
    try {
      const response = await authenticatedFetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          keys: [{ provider, key_name: keyName, key_value: keyValue.trim() }]
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: `Ключ ${keyName} сохранён`
        });
        await loadKeys();
      } else {
        throw new Error(data.error || 'Не удалось сохранить ключ');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSavingKey(null);
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
              {(yandexApiKey.startsWith('***') || yandexFolderId.startsWith('***') || yandexSpeechApiKey.startsWith('***') || openaiApiKey.startsWith('***') || googleSpeechApiKey.startsWith('***') || deepseekApiKey.startsWith('***') || openrouterApiKey.startsWith('***') || proxyapiApiKey.startsWith('***')) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Icon name="ShieldCheck" size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-green-900">
                      <p className="font-semibold mb-2">🔐 Ключи защищены</p>
                      <p className="text-green-800 mb-2">
                        Ваши API ключи сохранены и замаскированы для безопасности. Полные значения скрыты и доступны только серверу.
                      </p>
                      <p className="text-green-800">
                        <strong>Для изменения:</strong> Введите новые ключи в поля ниже и нажмите "Сохранить ключи". Обновятся только те ключи, которые вы измените.
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
                <div className="space-y-2 border rounded-lg p-3 bg-slate-50">
                  <Label htmlFor="yandex_api_key" className="flex items-center gap-2">
                    Yandex API Key
                    {yandexApiKey && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Icon name="CheckCircle2" size={12} />
                        Настроен
                      </span>
                    )}
                    {!yandexApiKey && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        <Icon name="CircleDashed" size={12} />
                        Не настроен
                      </span>
                    )}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="yandex_api_key"
                      type="password"
                      value={yandexApiKey.startsWith('***') ? '' : yandexApiKey}
                      onChange={(e) => setYandexApiKey(e.target.value)}
                      placeholder="AQVN... (введите новый ключ)"
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={() => handleSaveKey('yandex', 'api_key', yandexApiKey, 'yandex_api')}
                      disabled={savingKey === 'yandex_api'}
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      {savingKey === 'yandex_api' ? (
                        <Icon name="Loader2" size={14} className="animate-spin" />
                      ) : (
                        <Icon name="Save" size={14} />
                      )}
                    </Button>
                  </div>
                  {yandexApiKey && !yandexApiKey.startsWith('***') && (
                    <p className="text-xs text-muted-foreground">
                      Текущий: {maskKey(yandexApiKey)}
                    </p>
                  )}
                </div>

                <div className="space-y-2 border rounded-lg p-3 bg-slate-50">
                  <Label htmlFor="yandex_folder_id" className="flex items-center gap-2">
                    Yandex Folder ID
                    {yandexFolderId && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Icon name="CheckCircle2" size={12} />
                        Настроен
                      </span>
                    )}
                    {!yandexFolderId && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        <Icon name="CircleDashed" size={12} />
                        Не настроен
                      </span>
                    )}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="yandex_folder_id"
                      type="text"
                      value={yandexFolderId.startsWith('***') ? '' : yandexFolderId}
                      onChange={(e) => setYandexFolderId(e.target.value)}
                      placeholder="b1g... (введите новый ID)"
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={() => handleSaveKey('yandex', 'folder_id', yandexFolderId, 'yandex_folder')}
                      disabled={savingKey === 'yandex_folder'}
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      {savingKey === 'yandex_folder' ? (
                        <Icon name="Loader2" size={14} className="animate-spin" />
                      ) : (
                        <Icon name="Save" size={14} />
                      )}
                    </Button>
                  </div>
                  {yandexFolderId && !yandexFolderId.startsWith('***') && (
                    <p className="text-xs text-muted-foreground">
                      Текущий: {maskKey(yandexFolderId)}
                    </p>
                  )}
                </div>

                <div className="space-y-2 border rounded-lg p-3 bg-slate-50">
                  <Label htmlFor="yandex_speech_api_key" className="flex items-center gap-2">
                    Yandex SpeechKit API Key
                    {yandexSpeechApiKey && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Icon name="CheckCircle2" size={12} />
                        Настроен
                      </span>
                    )}
                    {!yandexSpeechApiKey && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        <Icon name="CircleDashed" size={12} />
                        Не настроен
                      </span>
                    )}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="yandex_speech_api_key"
                      type="password"
                      value={yandexSpeechApiKey.startsWith('***') ? '' : yandexSpeechApiKey}
                      onChange={(e) => setYandexSpeechApiKey(e.target.value)}
                      placeholder="AQVN... (для распознавания речи)"
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={() => handleSaveKey('yandex', 'YANDEX_SPEECHKIT_API_KEY', yandexSpeechApiKey, 'yandex_speech')}
                      disabled={savingKey === 'yandex_speech'}
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      {savingKey === 'yandex_speech' ? (
                        <Icon name="Loader2" size={14} className="animate-spin" />
                      ) : (
                        <Icon name="Save" size={14} />
                      )}
                    </Button>
                  </div>
                  {yandexSpeechApiKey && !yandexSpeechApiKey.startsWith('***') && (
                    <p className="text-xs text-muted-foreground">
                      Текущий: {maskKey(yandexSpeechApiKey)}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">Используется для распознавания голосовых сообщений (Yandex SpeechKit)</p>
                </div>
              </div>
            </div>

            {!fz152Enabled && (
            <>
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Icon name="Mic" size={16} className="text-purple-600 mt-0.5" />
                  <div className="text-sm text-purple-900">
                    <p className="font-medium mb-1">Ключи для распознавания речи</p>
                    <p className="text-purple-800">
                      Необходимы для обработки голосовых и видео-сообщений в чатах
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2 border rounded-lg p-3 bg-slate-50">
                  <Label htmlFor="openai_api_key" className="flex items-center gap-2">
                    OpenAI API Key (Whisper)
                    {openaiApiKey && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Icon name="CheckCircle2" size={12} />
                        Настроен
                      </span>
                    )}
                    {!openaiApiKey && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        <Icon name="CircleDashed" size={12} />
                        Не настроен
                      </span>
                    )}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="openai_api_key"
                      type="password"
                      value={openaiApiKey.startsWith('***') ? '' : openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      placeholder="sk-proj-... (для Whisper STT)"
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={() => handleSaveKey('openai', 'OPENAI_API_KEY', openaiApiKey, 'openai_api')}
                      disabled={savingKey === 'openai_api'}
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      {savingKey === 'openai_api' ? (
                        <Icon name="Loader2" size={14} className="animate-spin" />
                      ) : (
                        <Icon name="Save" size={14} />
                      )}
                    </Button>
                  </div>
                  {openaiApiKey && !openaiApiKey.startsWith('***') && (
                    <p className="text-xs text-muted-foreground">
                      Текущий: {maskKey(openaiApiKey)}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">Используется для распознавания речи через OpenAI Whisper ($0.006/мин)</p>
                </div>

                <div className="space-y-2 border rounded-lg p-3 bg-slate-50">
                  <Label htmlFor="google_speech_api_key" className="flex items-center gap-2">
                    Google Speech API Key
                    {googleSpeechApiKey && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Icon name="CheckCircle2" size={12} />
                        Настроен
                      </span>
                    )}
                    {!googleSpeechApiKey && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        <Icon name="CircleDashed" size={12} />
                        Не настроен
                      </span>
                    )}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="google_speech_api_key"
                      type="password"
                      value={googleSpeechApiKey.startsWith('***') ? '' : googleSpeechApiKey}
                      onChange={(e) => setGoogleSpeechApiKey(e.target.value)}
                      placeholder="AIzaSy... (для Speech-to-Text)"
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={() => handleSaveKey('google', 'GOOGLE_SPEECH_API_KEY', googleSpeechApiKey, 'google_speech')}
                      disabled={savingKey === 'google_speech'}
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      {savingKey === 'google_speech' ? (
                        <Icon name="Loader2" size={14} className="animate-spin" />
                      ) : (
                        <Icon name="Save" size={14} />
                      )}
                    </Button>
                  </div>
                  {googleSpeechApiKey && !googleSpeechApiKey.startsWith('***') && (
                    <p className="text-xs text-muted-foreground">
                      Текущий: {maskKey(googleSpeechApiKey)}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">Используется для распознавания речи через Google Cloud ($0.006/15 сек)</p>
                </div>
              </div>
            </div>
            </>
            )}

            {!fz152Enabled && (
            <>
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Icon name="Info" size={16} className="text-orange-600 mt-0.5" />
                  <div className="text-sm text-orange-900">
                    <p className="font-medium mb-2">DeepSeek API (прямой доступ)</p>
                    <p className="text-orange-800 mb-2">
                      <strong>DeepSeek V3:</strong> $0.14 вх / $0.28 вых (1M) — основная модель для чата
                    </p>
                    <p className="text-orange-800 mb-3">
                      <strong>DeepSeek R1:</strong> $0.55 вх / $2.19 вых (1M) — модель с рассуждениями
                    </p>
                    <div className="border-t border-orange-300 pt-3 mt-3">
                      <p className="font-medium mb-2">Как получить ключ DeepSeek:</p>
                      <ol className="list-decimal pl-4 space-y-1 text-orange-800">
                        <li>Перейдите на <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-orange-600">platform.deepseek.com</a></li>
                        <li>Зарегистрируйтесь или войдите в аккаунт</li>
                        <li>Пополните баланс минимум на $5</li>
                        <li>Перейдите в раздел API Keys</li>
                        <li>Создайте новый ключ → скопируйте (начинается с sk-...)</li>
                        <li>Вставьте ключ в поле ниже</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 border rounded-lg p-3 bg-slate-50">
                <Label htmlFor="deepseek_api_key" className="flex items-center gap-2">
                  DeepSeek API Key
                  {deepseekApiKey && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Icon name="CheckCircle2" size={12} />
                      Настроен
                    </span>
                  )}
                  {!deepseekApiKey && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      <Icon name="CircleDashed" size={12} />
                      Не настроен
                    </span>
                  )}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="deepseek_api_key"
                    type="password"
                    value={deepseekApiKey.startsWith('***') ? '' : deepseekApiKey}
                    onChange={(e) => setDeepseekApiKey(e.target.value)}
                    placeholder="sk-... (введите новый ключ)"
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={() => handleSaveKey('deepseek', 'api_key', deepseekApiKey, 'deepseek_api')}
                    disabled={savingKey === 'deepseek_api'}
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {savingKey === 'deepseek_api' ? (
                      <Icon name="Loader2" size={14} className="animate-spin" />
                    ) : (
                      <Icon name="Save" size={14} />
                    )}
                  </Button>
                </div>
                {deepseekApiKey && !deepseekApiKey.startsWith('***') && (
                  <p className="text-xs text-muted-foreground">
                    Текущий: {maskKey(deepseekApiKey)}
                  </p>
                )}
              </div>
            </div>

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

              <div className="space-y-2 border rounded-lg p-3 bg-slate-50">
                <Label htmlFor="openrouter_api_key" className="flex items-center gap-2">
                  OpenRouter API Key
                  {openrouterApiKey && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Icon name="CheckCircle2" size={12} />
                      Настроен
                    </span>
                  )}
                  {!openrouterApiKey && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      <Icon name="CircleDashed" size={12} />
                      Не настроен
                    </span>
                  )}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="openrouter_api_key"
                    type="password"
                    value={openrouterApiKey.startsWith('***') ? '' : openrouterApiKey}
                    onChange={(e) => setOpenrouterApiKey(e.target.value)}
                    placeholder="sk-or-... (введите новый ключ)"
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={() => handleSaveKey('openrouter', 'api_key', openrouterApiKey, 'openrouter_api')}
                    disabled={savingKey === 'openrouter_api'}
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {savingKey === 'openrouter_api' ? (
                      <Icon name="Loader2" size={14} className="animate-spin" />
                    ) : (
                      <Icon name="Save" size={14} />
                    )}
                  </Button>
                </div>
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

              <div className="space-y-2 border rounded-lg p-3 bg-slate-50">
                <Label htmlFor="proxyapi_api_key" className="flex items-center gap-2">
                  ProxyAPI Key
                  {proxyapiApiKey && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Icon name="CheckCircle2" size={12} />
                      Настроен
                    </span>
                  )}
                  {!proxyapiApiKey && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      <Icon name="CircleDashed" size={12} />
                      Не настроен
                    </span>
                  )}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="proxyapi_api_key"
                    type="password"
                    value={proxyapiApiKey.startsWith('***') ? '' : proxyapiApiKey}
                    onChange={(e) => setProxyapiApiKey(e.target.value)}
                    placeholder="sk-... (введите новый ключ)"
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={() => handleSaveKey('proxyapi', 'api_key', proxyapiApiKey, 'proxyapi_api')}
                    disabled={savingKey === 'proxyapi_api'}
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {savingKey === 'proxyapi_api' ? (
                      <Icon name="Loader2" size={14} className="animate-spin" />
                    ) : (
                      <Icon name="Save" size={14} />
                    )}
                  </Button>
                </div>
                {proxyapiApiKey && !proxyapiApiKey.startsWith('***') && (
                  <p className="text-xs text-muted-foreground">
                    Текущий: {maskKey(proxyapiApiKey)}
                  </p>
                )}
              </div>
            </div>
            </>
            )}


          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TenantApiKeysCard;