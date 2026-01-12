import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

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
        setWebhookStatus('active');
        toast({
          title: 'Успешно!',
          description: 'WhatsApp-бот подключен и готов к работе'
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

        <div className="bg-green-50 p-4 rounded-lg text-sm space-y-2">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={16} className="text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">Как подключить:</p>
              <ol className="text-green-800 mt-2 space-y-1 list-decimal list-inside">
                <li>Создайте приложение в Meta for Developers</li>
                <li>Настройте WhatsApp Business API</li>
                <li>Скопируйте Phone Number ID и Access Token</li>
                <li>Настройте Webhook URL в Meta консоли</li>
                <li>Нажмите "Подключить бота"</li>
              </ol>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppSettingsCard;
