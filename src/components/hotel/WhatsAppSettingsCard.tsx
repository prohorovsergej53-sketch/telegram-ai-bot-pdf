import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { authenticatedFetch, getTenantId } from '@/lib/auth';
import { BACKEND_URLS } from './types';

interface WhatsAppSettingsCardProps {
  webhookUrl: string;
  chatFunctionUrl: string;
}

const WhatsAppSettingsCard = ({ webhookUrl, chatFunctionUrl }: WhatsAppSettingsCardProps) => {
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<'not_set' | 'active' | 'error'>('not_set');
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const tenantId = getTenantId();
      const response = await authenticatedFetch(
        `${BACKEND_URLS.messengerSettings}?tenant_id=${tenantId}&messenger_type=whatsapp`
      );
      const data = await response.json();
      if (data.settings) {
        setPhoneNumberId(data.settings.phone_number_id || '');
        setAccessToken(data.settings.access_token || '');
      }
    } catch (error) {
      console.error('Error loading WhatsApp settings:', error);
    }
  };

  const saveSettings = async (phoneId: string, token: string) => {
    const tenantId = getTenantId();
    await authenticatedFetch(BACKEND_URLS.messengerSettings, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant_id: tenantId,
        messenger_type: 'whatsapp',
        settings: { phone_number_id: phoneId, access_token: token }
      })
    });
  };

  const handleSetupBot = async () => {
    if (!phoneNumberId.trim() || !accessToken.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const whatsappApiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/subscribed_apps`;
      
      const response = await fetch(whatsappApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        await saveSettings(phoneNumberId, accessToken);
        setWebhookStatus('active');
        toast({
          title: 'Успешно!',
          description: 'WhatsApp-бот подключен и сохранен'
        });
      } else {
        throw new Error(data.error?.message || 'Ошибка подключения');
      }
    } catch (error: any) {
      setWebhookStatus('error');
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось настроить webhook',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckWebhook = async () => {
    if (!phoneNumberId.trim() || !accessToken.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const whatsappApiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/subscribed_apps`;
      
      const response = await fetch(whatsappApiUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        setWebhookStatus('active');
        toast({
          title: 'Webhook активен',
          description: 'Подключение активно'
        });
      } else {
        setWebhookStatus('not_set');
        toast({
          title: 'Webhook не настроен',
          description: 'Нажмите "Подключить бота" для настройки'
        });
      }
    } catch (error: any) {
      setWebhookStatus('error');
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
      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-green-50">
        <CardTitle className="flex items-center gap-2">
          <Icon name="MessageSquare" size={20} />
          WhatsApp-бот
        </CardTitle>
        <CardDescription>Подключите бота для работы через WhatsApp Business API</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Phone Number ID
          </label>
          <Input
            type="text"
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
            placeholder="123456789012345"
            className="font-mono text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Access Token
          </label>
          <Input
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="EAAxxxxxxxxxx..."
            className="font-mono text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">
            Получите токен в <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Meta for Developers</a>
          </p>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleSetupBot}
            disabled={isLoading || !phoneNumberId.trim() || !accessToken.trim()}
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
            disabled={isLoading || !phoneNumberId.trim() || !accessToken.trim()}
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
                    : 'Проверьте данные и попробуйте снова'}
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

        <div className="bg-green-50 p-4 rounded-lg text-sm space-y-3">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={16} className="text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-900 mb-2">📋 Инструкция по подключению WhatsApp Business API:</p>
              <ol className="text-green-800 space-y-2 list-decimal list-inside">
                <li className="pl-1"><strong>Зайдите в <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-950">Meta for Developers</a>:</strong> создайте новое приложение (тип: Business)</li>
                <li className="pl-1"><strong>Добавьте WhatsApp:</strong> в панели приложения нажмите "Add Product" → выберите "WhatsApp" → настройте профиль бизнеса</li>
                <li className="pl-1"><strong>Получите данные:</strong> WhatsApp → API Setup → скопируйте <code className="bg-green-100 px-1 rounded">Phone Number ID</code> и <code className="bg-green-100 px-1 rounded">Access Token</code></li>
                <li className="pl-1"><strong>Настройте Webhook:</strong> WhatsApp → Configuration → вставьте Webhook URL (указан выше) и Verify Token из секретов</li>
                <li className="pl-1"><strong>Подпишитесь на события:</strong> включите <code className="bg-green-100 px-1 rounded">messages</code> в Webhook Fields</li>
                <li className="pl-1"><strong>Запустите бота:</strong> вставьте Phone Number ID и Access Token в поля выше → нажмите "Подключить бота"</li>
              </ol>
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-green-900 font-medium mb-1">💡 Полезные ссылки:</p>
                <ul className="text-green-700 text-xs space-y-1">
                  <li>• <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900">Meta for Developers</a> — консоль разработчика</li>
                  <li>• <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900">Официальная документация</a> WhatsApp Cloud API</li>
                  <li>• <a href="https://business.facebook.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900">Meta Business Suite</a> — управление бизнес-аккаунтом</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppSettingsCard;