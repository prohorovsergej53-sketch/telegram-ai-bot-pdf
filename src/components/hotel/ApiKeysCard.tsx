import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { authenticatedFetch } from '@/lib/auth';
import { BACKEND_URLS } from './types';

interface ApiKey {
  provider: string;
  key_name: string;
  key_value: string;
  is_active: boolean;
}

const API_KEY_CONFIGS = [
  { provider: 'yandexgpt', key_name: 'api_key', label: 'YandexGPT API Key', placeholder: 'AQVN***', category: 'AI' },
  { provider: 'yandexgpt', key_name: 'folder_id', label: 'YandexGPT Folder ID', placeholder: 'b1g***', category: 'AI' },
  { provider: 'telegram', key_name: 'bot_token', label: 'Telegram Bot Token', placeholder: '1234567890:***', category: 'Мессенджеры' },
  { provider: 'whatsapp', key_name: 'phone_number_id', label: 'WhatsApp Phone Number ID', placeholder: '123456789012345', category: 'Мессенджеры' },
  { provider: 'whatsapp', key_name: 'access_token', label: 'WhatsApp Access Token', placeholder: 'EAAxxxxx...', category: 'Мессенджеры' },
  { provider: 'max', key_name: 'bot_token', label: 'MAX Bot Token', placeholder: '1234567890:***', category: 'Мессенджеры' },
  { provider: 'vk', key_name: 'group_id', label: 'VK Group ID', placeholder: '123456789', category: 'Мессенджеры' },
  { provider: 'vk', key_name: 'group_token', label: 'VK Group Token', placeholder: 'vk1.a.xxxxx...', category: 'Мессенджеры' },
  { provider: 'vk', key_name: 'secret_key', label: 'VK Secret Key (опционально)', placeholder: 'secret123', category: 'Мессенджеры' },
];

const ApiKeysCard = () => {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const response = await authenticatedFetch(BACKEND_URLS.manageApiKeys);
      const data = await response.json();
      if (data.keys) {
        const loadedKeys: Record<string, string> = {};
        data.keys.forEach((key: any) => {
          const keyId = `${key.provider}_${key.key_name}`;
          loadedKeys[keyId] = key.has_value ? '********' : '';
        });
        setKeys(loadedKeys);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  };

  const handleSave = async (provider: string, keyName: string) => {
    const keyId = `${provider}_${keyName}`;
    const value = keys[keyId];

    if (!value || value.trim() === '') {
      toast({
        title: 'Ошибка',
        description: 'Введите значение ключа',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authenticatedFetch(BACKEND_URLS.manageApiKeys, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, key_name: keyName, key_value: value })
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'API ключ сохранён'
        });
        setKeys(prev => ({ ...prev, [keyId]: '********' }));
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка сохранения');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось сохранить ключ',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowValue = (keyId: string) => {
    setShowValues(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Key" size={20} />
          API Ключи
        </CardTitle>
        <CardDescription>
          Настройте свои API ключи для работы с внешними сервисами
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Icon name="AlertTriangle" size={18} className="text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Важно: Нет fallback на общие ключи</p>
              <p>Если ключ не настроен, функция не будет работать. Общие демо-ключи больше НЕ используются для безопасности.</p>
            </div>
          </div>
        </div>

        {['AI', 'Мессенджеры'].map(category => (
          <div key={category} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">{category}</h3>
            {API_KEY_CONFIGS.filter(c => c.category === category).map(config => {
              const keyId = `${config.provider}_${config.key_name}`;
              const isVisible = showValues[keyId];
              
              return (
                <div key={keyId} className="border rounded-lg p-4 space-y-3">
                  <Label htmlFor={keyId} className="text-base font-semibold">
                    {config.label}
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        id={keyId}
                        type={isVisible ? 'text' : 'password'}
                        placeholder={config.placeholder}
                        value={keys[keyId] || ''}
                        onChange={(e) => setKeys({ ...keys, [keyId]: e.target.value })}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => toggleShowValue(keyId)}
                      >
                        <Icon name={isVisible ? 'EyeOff' : 'Eye'} size={16} />
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleSave(config.provider, config.key_name)}
                      disabled={isLoading}
                    >
                      <Icon name="Save" size={16} className="mr-2" />
                      Сохранить
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ApiKeysCard;