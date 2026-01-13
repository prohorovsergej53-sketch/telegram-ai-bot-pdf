import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { authenticatedFetch, getTenantId } from '@/lib/auth';
import { BACKEND_URLS } from './types';

interface MAXSettingsCardProps {
  webhookUrl: string;
  chatFunctionUrl: string;
}

const MAXSettingsCard = ({ webhookUrl, chatFunctionUrl }: MAXSettingsCardProps) => {
  const [botToken, setBotToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<'not_set' | 'active' | 'error'>('not_set');
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await authenticatedFetch(BACKEND_URLS.manageApiKeys);
      const data = await response.json();
      if (data.keys) {
        const token = data.keys.find((k: any) => k.provider === 'max' && k.key_name === 'bot_token');
        if (token?.has_value) {
          setBotToken('********');
        }
      }
    } catch (error) {
      console.error('Error loading MAX settings:', error);
    }
  };

  const saveSettings = async (token: string) => {
    await authenticatedFetch(BACKEND_URLS.manageApiKeys, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'max',
        key_name: 'bot_token',
        key_value: token
      })
    });
  };

  const handleSetupBot = async () => {
    if (!botToken.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите токен бота',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`https://platform-api.max.ru/bot${botToken}/getMe`);
      const data = await response.json();

      if (data.ok) {
        await saveSettings(botToken);
        setWebhookStatus('active');
        toast({
          title: 'Успешно!',
          description: 'MAX-бот подключен и готов к работе'
        });
      } else {
        throw new Error(data.description || 'Ошибка проверки токена');
      }
    } catch (error: any) {
      setWebhookStatus('error');
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось настроить MAX бота',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckWebhook = async () => {
    if (!botToken.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите токен бота',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`https://platform-api.max.ru/bot${botToken}/getWebhookInfo`);
      const data = await response.json();

      if (data.ok && data.result.url === webhookUrl) {
        setWebhookStatus('active');
        toast({
          title: 'Webhook активен',
          description: `URL: ${data.result.url}`
        });
      } else if (data.ok && data.result.url) {
        setWebhookStatus('error');
        toast({
          title: 'Некорректный webhook',
          description: `Текущий URL: ${data.result.url}`,
          variant: 'destructive'
        });
      } else {
        setWebhookStatus('not_set');
        toast({
          title: 'Webhook не настроен',
          description: 'Нажмите "Подключить бота" для настройки'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось проверить webhook',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <Icon name="Bot" size={20} />
          MAX-бот
        </CardTitle>
        <CardDescription>Подключите бота для работы через MAX (max.ru)</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Токен бота
          </label>
          <Input
            type="password"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
            className="font-mono text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">
            Получите токен у <a href="https://max.ru/developers/bots" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@MaxBotFather</a>
          </p>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleSetupBot}
            disabled={isLoading || !botToken.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Подключение...
              </>
            ) : (
              <>
                <Icon name="Link" size={16} className="mr-2" />
                Подключить бота
              </>
            )}
          </Button>

          <Button
            onClick={handleCheckWebhook}
            disabled={isLoading || !botToken.trim()}
            variant="outline"
            className="w-full"
          >
            <Icon name="Info" size={16} className="mr-2" />
            Проверить статус
          </Button>
        </div>

        {webhookStatus !== 'not_set' && (
          <div className={`p-4 rounded-lg ${
            webhookStatus === 'active' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start gap-2">
              <Icon 
                name={webhookStatus === 'active' ? 'CheckCircle' : 'XCircle'} 
                size={18} 
                className={webhookStatus === 'active' ? 'text-green-600' : 'text-red-600'} 
              />
              <div className="flex-1">
                <p className={`font-medium text-sm ${
                  webhookStatus === 'active' ? 'text-green-900' : 'text-red-900'
                }`}>
                  {webhookStatus === 'active' ? 'Бот активен' : 'Ошибка подключения'}
                </p>
                <p className={`text-xs mt-1 ${
                  webhookStatus === 'active' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {webhookStatus === 'active' 
                    ? 'Бот готов принимать сообщения' 
                    : 'Проверьте токен и попробуйте снова'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t pt-4 space-y-2">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs font-medium text-slate-700 mb-1">Webhook URL:</p>
            <code className="text-xs text-slate-600 break-all">{webhookUrl}</code>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs font-medium text-slate-700 mb-1">Chat Function URL:</p>
            <code className="text-xs text-slate-600 break-all">{chatFunctionUrl}</code>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg text-sm space-y-2">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={16} className="text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium text-purple-900">Как подключить:</p>
              <ol className="text-purple-800 mt-2 space-y-1 list-decimal list-inside">
                <li>Зарегистрируйтесь на платформе MAX</li>
                <li>Создайте бота через @MaxBotFather</li>
                <li>Скопируйте токен и вставьте выше</li>
                <li>Нажмите "Подключить бота"</li>
                <li>Готово! Напишите боту в MAX</li>
              </ol>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MAXSettingsCard;