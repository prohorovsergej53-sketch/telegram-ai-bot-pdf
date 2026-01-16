import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SEONotificationCard = () => {
  const { toast } = useToast();
  const [isNotifying, setIsNotifying] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const notifySearchEngines = async () => {
    setIsNotifying(true);
    setLastResult(null);

    try {
      const response = await fetch('https://functions.poehali.dev/9f68c535-c71e-4e3d-a71e-dd0f905ae0c4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setLastResult(data);

      if (data.success) {
        toast({
          title: 'Поисковики уведомлены!',
          description: data.message,
        });
      } else {
        toast({
          title: 'Ошибка уведомления',
          description: data.message || 'Не удалось уведомить поисковики',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить запрос',
        variant: 'destructive'
      });
    } finally {
      setIsNotifying(false);
    }
  };

  const getStatusIcon = (result: any) => {
    if (!result) return null;
    if (result.success) return <Icon name="CheckCircle2" className="text-green-600" size={20} />;
    return <Icon name="XCircle" className="text-red-600" size={20} />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Globe" size={24} />
          Уведомление поисковых систем
        </CardTitle>
        <CardDescription>
          Мгновенное уведомление Google, Яндекс, Bing и других поисковиков об обновлениях сайта
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Icon name="Info" size={16} />
          <AlertDescription>
            При нажатии на кнопку будут уведомлены: IndexNow API, Bing, Yandex, Google Ping, Bing Ping и Ping-O-Matic (охватывает десятки сервисов)
          </AlertDescription>
        </Alert>

        <div className="flex items-center gap-4">
          <Button 
            onClick={notifySearchEngines} 
            disabled={isNotifying}
            size="lg"
            className="flex-1"
          >
            {isNotifying ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Уведомление...
              </>
            ) : (
              <>
                <Icon name="Megaphone" size={20} className="mr-2" />
                Уведомить все поисковики
              </>
            )}
          </Button>
        </div>

        {lastResult && (
          <div className="mt-6 space-y-3">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <Icon name="BarChart3" size={18} />
              Результаты последнего уведомления
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {lastResult.results?.map((result: any, index: number) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    result.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result)}
                    <div>
                      <div className="font-medium text-sm">{result.endpoint}</div>
                      {result.error && (
                        <div className="text-xs text-red-600">{result.error}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    HTTP {result.status || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle2" size={20} className="text-blue-600" />
                <span className="font-semibold text-blue-900">
                  Успешно уведомлено: {lastResult.services_notified || 0} из {lastResult.results?.length || 0}
                </span>
              </div>
              <div className="text-sm text-blue-700">
                {lastResult.urls_submitted} URL отправлено
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SEONotificationCard;
