import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { BACKEND_URLS } from './types';
import { getTenantId } from '@/lib/auth';
import { getTenantId } from '@/lib/auth';

interface APIConnectionStatus {
  provider: 'yandex' | 'openai' | 'openrouter';
  connected: boolean;
  lastChecked?: string;
  error?: string;
}



const AISettingsCard = () => {
  const [apiKey, setApiKey] = useState('');
  const [folderId, setFolderId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [apiStatus, setApiStatus] = useState<APIConnectionStatus | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'not_set' | 'active' | 'error'>('not_set');
  const { toast } = useToast();
  const tenantId = getTenantId();

  const handleConnect = async () => {
    if (!apiKey.trim() || !folderId.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите API ключ и Folder ID',
        variant: 'destructive'
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Проверяем валидность ключа через backend
      const validateResponse = await fetch(BACKEND_URLS.yandexApiValidation, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          folder_id: folderId
        })
      });

      const validateData = await validateResponse.json();

      if (validateData.valid) {
        // Сохраняем ключи в БД через API
        const saveResponse = await fetch(`${BACKEND_URLS.manageApiKeys}?tenant_id=${tenantId}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
          },
          body: JSON.stringify({
            provider: 'yandex',
            key_name: 'api_key',
            key_value: apiKey
          })
        });

        const saveData = await saveResponse.json();

        if (saveData.success) {
          // Сохраняем folder_id
          await fetch(`${BACKEND_URLS.manageApiKeys}?tenant_id=${tenantId}`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
            },
            body: JSON.stringify({
              provider: 'yandex',
              key_name: 'folder_id',
              key_value: folderId
            })
          });

          setConnectionStatus('active');
          toast({
            title: '✓ Ключ успешно сохранён',
            description: 'API ключ YandexGPT проверен и сохранён'
          });
          setApiKey('');
          setFolderId('');
          // Сразу проверяем статус после успешной валидации
          checkApiStatus('yandex');
        } else {
          throw new Error(saveData.error || 'Не удалось сохранить ключ');
        }
      } else {
        setConnectionStatus('error');
        toast({
          title: 'Ошибка валидации',
          description: validateData.error || 'Проверьте правильность API ключа и Folder ID',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      setConnectionStatus('error');
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось подключить API',
        variant: 'destructive'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const getStatusBadge = () => {
    if (connectionStatus === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          <Icon name="CheckCircle" size={12} />
          Подключено
        </span>
      );
    }
    if (connectionStatus === 'error') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
          <Icon name="XCircle" size={12} />
          Ошибка
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
        <Icon name="Circle" size={12} />
        Не настроено
      </span>
    );
  };

  const checkApiStatus = async (provider: 'yandex' | 'openai' | 'openrouter') => {
    setIsCheckingStatus(true);
    try {
      // Проверка подключения к API
      const response = await fetch(BACKEND_URLS.yandexApiValidation, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_status' })
      });

      const data = await response.json();

      setApiStatus({
        provider,
        connected: data.valid || false,
        lastChecked: new Date().toLocaleString('ru-RU'),
        error: data.error
      });
    } catch (error) {
      console.error('Error checking API status:', error);
      setApiStatus({
        provider,
        connected: false,
        error: 'Не удалось проверить статус'
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };



  return (
    <Card className="shadow-xl">
      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Key" size={20} />
            Подключение AI
          </div>
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>Добавьте свой API ключ для работы с AI моделями</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-2">Как получить API ключ YandexGPT:</p>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Перейдите в <a href="https://console.yandex.cloud" target="_blank" rel="noopener noreferrer" className="underline">Yandex Cloud Console</a></li>
                <li>Создайте сервисный аккаунт и получите API ключ</li>
                <li>Скопируйте Folder ID из настроек облака</li>
                <li>Вставьте оба значения в поля ниже</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              API ключ YandexGPT
            </label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AQVN..."
              className="font-mono text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Folder ID
            </label>
            <Input
              type="text"
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              placeholder="b1g..."
              className="font-mono text-sm"
            />
          </div>

          <Button
            onClick={handleConnect}
            disabled={isConnecting || !apiKey.trim() || !folderId.trim()}
            className="w-full"
          >
            {isConnecting ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Подключение...
              </>
            ) : (
              <>
                <Icon name="Plug" size={16} className="mr-2" />
                Подключить API
              </>
            )}
          </Button>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-slate-700">Статус подключения</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => checkApiStatus('yandex')}
              disabled={isCheckingStatus}
            >
              {isCheckingStatus ? (
                <>
                  <Icon name="Loader2" size={14} className="mr-2 animate-spin" />
                  Проверка...
                </>
              ) : (
                <>
                  <Icon name="RefreshCw" size={14} className="mr-2" />
                  Проверить статус
                </>
              )}
            </Button>
          </div>

          {apiStatus && (
            <div
              className={`p-4 rounded-lg ${
                apiStatus.connected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon
                    name={apiStatus.connected ? 'CheckCircle' : 'XCircle'}
                    size={20}
                    className={apiStatus.connected ? 'text-green-600' : 'text-red-600'}
                  />
                  <span className="text-sm font-semibold text-slate-900">
                    {apiStatus.provider === 'yandex' ? 'YandexGPT' : apiStatus.provider === 'openai' ? 'OpenAI' : 'OpenRouter'}
                  </span>
                </div>
                <span className={`text-sm font-semibold ${
                  apiStatus.connected ? 'text-green-700' : 'text-red-700'
                }`}>
                  {apiStatus.connected ? 'Подключено' : 'Не подключено'}
                </span>
              </div>
              {apiStatus.lastChecked && (
                <p className="text-xs text-slate-600 mt-2">
                  Последняя проверка: {apiStatus.lastChecked}
                </p>
              )}
              {apiStatus.error && !apiStatus.connected && (
                <p className="text-xs text-red-700 mt-2">
                  Ошибка: {apiStatus.error}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Icon name="AlertTriangle" size={16} className="text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-medium mb-1">Важно:</p>
              <p className="text-amber-800">
                Без подключенного API ключа YandexGPT чат-бот не сможет отвечать на вопросы гостей.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AISettingsCard;