import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authenticatedFetch } from '@/lib/auth';
import Icon from '@/components/ui/icon';
import { BACKEND_URLS } from './types';

interface CronJob {
  jobId: number;
  enabled: boolean;
  title: string;
  url: string;
  schedule: {
    hours: number[];
    minutes: number[];
    timezone: string;
  };
  lastExecution?: string;
  nextExecution?: string;
}

interface AutomationSettings {
  cronjob_api_key: string;
  cronjob_enabled: boolean;
  check_subscriptions_job?: CronJob;
  cleanup_embeddings_job?: CronJob;
  db_backup_job?: CronJob;
  analytics_report_job?: CronJob;
}

export const AutomationTab = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AutomationSettings | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingSubscriptions, setIsTestingSubscriptions] = useState(false);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(BACKEND_URLS.automationSettings);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setApiKey(data.cronjob_api_key || '');
      } else {
        throw new Error('Ошибка загрузки настроек');
      }
    } catch (error) {
      console.error('Error loading automation settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить настройки автоматизации',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: 'Ошибка',
        description: 'API ключ не может быть пустым',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await authenticatedFetch(BACKEND_URLS.automationSettings, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_api_key',
          api_key: apiKey
        })
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'API ключ сохранён'
        });
        await loadSettings();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка сохранения');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось сохранить API ключ',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const enableSubscriptionCheck = async () => {
    setIsSaving(true);
    try {
      const response = await authenticatedFetch(BACKEND_URLS.automationSettings, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enable_subscription_check'
        })
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Автоматическая проверка подписок включена (ежедневно в 9:00 МСК)'
        });
        await loadSettings();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка настройки');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось настроить автоматическую проверку',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const disableSubscriptionCheck = async () => {
    setIsSaving(true);
    try {
      const response = await authenticatedFetch(BACKEND_URLS.automationSettings, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'disable_subscription_check'
        })
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Автоматическая проверка подписок отключена'
        });
        await loadSettings();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка отключения');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось отключить автоматическую проверку',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testSubscriptionCheck = async () => {
    setIsTestingSubscriptions(true);
    try {
      const response = await authenticatedFetch(BACKEND_URLS.automationSettings, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_subscription_check'
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Проверка выполнена',
          description: `Найдено истекших: ${result.expired_count}, уведомлений отправлено: ${result.notifications_sent}`
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка проверки');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось выполнить проверку',
        variant: 'destructive'
      });
    } finally {
      setIsTestingSubscriptions(false);
    }
  };

  const toggleJob = async (jobName: string, enable: boolean) => {
    setIsSaving(true);
    try {
      const action = enable ? `enable_${jobName}` : `disable_${jobName}`;
      const response = await authenticatedFetch(BACKEND_URLS.automationSettings, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Успешно',
          description: result.message
        });
        await loadSettings();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка переключения');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось переключить задание',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Icon name="Loader2" className="animate-spin mx-auto mb-2" size={32} />
          <p className="text-slate-600">Загрузка настроек...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Автоматизация</h2>
        <p className="text-slate-600">Настройка автоматических задач и интеграций</p>
      </div>

      {/* API ключ Cron-job.org */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Key" size={20} />
            API ключ Cron-job.org
          </CardTitle>
          <CardDescription>
            Для автоматического запуска задач используется сервис cron-job.org
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API ключ</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Вставьте API ключ от cron-job.org"
              />
              <Button onClick={saveApiKey} disabled={isSaving || !apiKey.trim()}>
                {isSaving ? <Icon name="Loader2" className="animate-spin" size={16} /> : 'Сохранить'}
              </Button>
            </div>
            <p className="text-xs text-slate-600">
              Получить ключ можно на{' '}
              <a
                href="https://console.cron-job.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                console.cron-job.org
              </a>
              {' '}в разделе Account → API
            </p>
          </div>

          {settings?.cronjob_enabled && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Icon name="CheckCircle2" size={20} className="text-green-600" />
              <span className="text-sm text-green-700 font-medium">API ключ настроен</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Автоматическая проверка подписок */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Bell" size={20} />
            Проверка истечения подписок
          </CardTitle>
          <CardDescription>
            Автоматическая проверка подписок и отправка уведомлений владельцам тенантов
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!settings?.cronjob_enabled ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                Сначала настройте API ключ Cron-job.org выше
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">Статус</p>
                    <p className="text-sm text-slate-600">
                      {settings.check_subscriptions_job?.enabled ? 'Включено' : 'Отключено'}
                    </p>
                  </div>
                  {settings.check_subscriptions_job?.enabled ? (
                    <Icon name="CheckCircle2" size={24} className="text-green-600" />
                  ) : (
                    <Icon name="XCircle" size={24} className="text-slate-400" />
                  )}
                </div>

                {settings.check_subscriptions_job?.enabled && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium">Расписание</p>
                        <p className="text-sm text-slate-600">Ежедневно в 9:00 (МСК)</p>
                      </div>
                      <Icon name="Clock" size={24} className="text-blue-600" />
                    </div>

                    {settings.check_subscriptions_job.nextExecution && (
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">Следующий запуск</p>
                          <p className="text-sm text-slate-600">
                            {new Date(settings.check_subscriptions_job.nextExecution).toLocaleString('ru-RU')}
                          </p>
                        </div>
                        <Icon name="Calendar" size={24} className="text-blue-600" />
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-2">
                {settings.check_subscriptions_job?.enabled ? (
                  <Button
                    variant="outline"
                    onClick={disableSubscriptionCheck}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? <Icon name="Loader2" className="animate-spin mr-2" size={16} /> : null}
                    Отключить автопроверку
                  </Button>
                ) : (
                  <Button
                    onClick={enableSubscriptionCheck}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? <Icon name="Loader2" className="animate-spin mr-2" size={16} /> : null}
                    Включить автопроверку
                  </Button>
                )}

                <Button
                  variant="secondary"
                  onClick={testSubscriptionCheck}
                  disabled={isTestingSubscriptions}
                  className="flex-1"
                >
                  {isTestingSubscriptions ? (
                    <Icon name="Loader2" className="animate-spin mr-2" size={16} />
                  ) : (
                    <Icon name="Play" className="mr-2" size={16} />
                  )}
                  Запустить сейчас
                </Button>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Что делает автопроверка:</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Проверяет подписки с истёкшим сроком и меняет статус на "expired"</li>
                  <li>Отправляет уведомления владельцам за 7, 3 и 1 день до истечения</li>
                  <li>Использует email шаблоны из базы данных</li>
                  <li>Логирует все действия для мониторинга</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Очистка эмбеддингов */}
      {settings?.cronjob_enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Trash2" size={20} />
              Очистка устаревших эмбеддингов
            </CardTitle>
            <CardDescription>
              Автоматическое удаление эмбеддингов удалённых документов (экономия места в БД)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">Статус</p>
                  <p className="text-sm text-slate-600">
                    {settings.cleanup_embeddings_job?.enabled ? 'Включено' : 'Отключено'}
                  </p>
                </div>
                {settings.cleanup_embeddings_job?.enabled ? (
                  <Icon name="CheckCircle2" size={24} className="text-green-600" />
                ) : (
                  <Icon name="XCircle" size={24} className="text-slate-400" />
                )}
              </div>

              {settings.cleanup_embeddings_job?.enabled && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">Расписание</p>
                    <p className="text-sm text-slate-600">Ежедневно в 3:00 (МСК)</p>
                  </div>
                  <Icon name="Clock" size={24} className="text-blue-600" />
                </div>
              )}
            </div>

            <Button
              onClick={() => toggleJob('cleanup_embeddings', !settings.cleanup_embeddings_job?.enabled)}
              disabled={isSaving}
              variant={settings.cleanup_embeddings_job?.enabled ? 'outline' : 'default'}
              className="w-full"
            >
              {isSaving ? <Icon name="Loader2" className="animate-spin mr-2" size={16} /> : null}
              {settings.cleanup_embeddings_job?.enabled ? 'Отключить' : 'Включить'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Резервное копирование БД */}
      {settings?.cronjob_enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Database" size={20} />
              Резервное копирование БД
            </CardTitle>
            <CardDescription>
              Ежедневный автоматический бэкап базы данных в S3 хранилище
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">Статус</p>
                  <p className="text-sm text-slate-600">
                    {settings.db_backup_job?.enabled ? 'Включено' : 'Отключено'}
                  </p>
                </div>
                {settings.db_backup_job?.enabled ? (
                  <Icon name="CheckCircle2" size={24} className="text-green-600" />
                ) : (
                  <Icon name="XCircle" size={24} className="text-slate-400" />
                )}
              </div>

              {settings.db_backup_job?.enabled && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">Расписание</p>
                    <p className="text-sm text-slate-600">Ежедневно в 2:00 (МСК)</p>
                  </div>
                  <Icon name="Clock" size={24} className="text-blue-600" />
                </div>
              )}
            </div>

            <Button
              onClick={() => toggleJob('db_backup', !settings.db_backup_job?.enabled)}
              disabled={isSaving}
              variant={settings.db_backup_job?.enabled ? 'outline' : 'default'}
              className="w-full"
            >
              {isSaving ? <Icon name="Loader2" className="animate-spin mr-2" size={16} /> : null}
              {settings.db_backup_job?.enabled ? 'Отключить' : 'Включить'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Еженедельный отчёт */}
      {settings?.cronjob_enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="BarChart3" size={20} />
              Еженедельный отчёт по аналитике
            </CardTitle>
            <CardDescription>
              Автоматическая отправка отчёта по всем тенантам на email суперадмина (по понедельникам)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">Статус</p>
                  <p className="text-sm text-slate-600">
                    {settings.analytics_report_job?.enabled ? 'Включено' : 'Отключено'}
                  </p>
                </div>
                {settings.analytics_report_job?.enabled ? (
                  <Icon name="CheckCircle2" size={24} className="text-green-600" />
                ) : (
                  <Icon name="XCircle" size={24} className="text-slate-400" />
                )}
              </div>

              {settings.analytics_report_job?.enabled && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">Расписание</p>
                    <p className="text-sm text-slate-600">Каждый понедельник в 10:00 (МСК)</p>
                  </div>
                  <Icon name="Clock" size={24} className="text-blue-600" />
                </div>
              )}
            </div>

            <Button
              onClick={() => toggleJob('analytics_report', !settings.analytics_report_job?.enabled)}
              disabled={isSaving}
              variant={settings.analytics_report_job?.enabled ? 'outline' : 'default'}
              className="w-full"
            >
              {isSaving ? <Icon name="Loader2" className="animate-spin mr-2" size={16} /> : null}
              {settings.analytics_report_job?.enabled ? 'Отключить' : 'Включить'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};