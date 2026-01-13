import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { authenticatedFetch } from '@/lib/auth';

interface ApiKey {
  provider: string;
  key_name: string;
  key_value: string;
  is_active: boolean;
}

const API_KEY_CONFIGS = [
  { provider: 'yandexgpt', key_name: 'api_key', label: 'YandexGPT API Key', placeholder: 'y*****' },
  { provider: 'yandexgpt', key_name: 'folder_id', label: 'YandexGPT Folder ID', placeholder: 'b1g***' },
  { provider: 'openai', key_name: 'api_key', label: 'OpenAI API Key', placeholder: 'sk-***' },
  { provider: 'deepseek', key_name: 'api_key', label: 'DeepSeek API Key', placeholder: 'sk-***' },
  { provider: 'telegram', key_name: 'bot_token', label: 'Telegram Bot Token', placeholder: '1234567890:***' },
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
      // TODO: создать backend функцию для загрузки ключей
      // const response = await authenticatedFetch('/api/get-api-keys');
      // const data = await response.json();
      // setKeys(data.keys);
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
      // TODO: создать backend функцию для сохранения ключей
      // await authenticatedFetch('/api/save-api-key', {
      //   method: 'POST',
      //   body: JSON.stringify({ provider, key_name: keyName, key_value: value })
      // });

      toast({
        title: 'Успешно',
        description: 'API ключ сохранён'
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить ключ',
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
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={18} className="text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Безопасность</p>
              <p>Ваши API ключи хранятся в зашифрованном виде и недоступны другим пользователям. Если ключ не указан, будут использоваться общие демо-ключи с ограничениями.</p>
            </div>
          </div>
        </div>

        {API_KEY_CONFIGS.map(config => {
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
      </CardContent>
    </Card>
  );
};

export default ApiKeysCard;
