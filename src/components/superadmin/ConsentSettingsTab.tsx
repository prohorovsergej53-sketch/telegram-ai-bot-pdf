import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { authenticatedFetch } from '@/lib/auth';
import Icon from '@/components/ui/icon';
import { BACKEND_URLS } from './types';

interface ConsentSettings {
  enabled: boolean;
  text: string;
}

export const ConsentSettingsTab = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [globalSettings, setGlobalSettings] = useState<ConsentSettings>({
    enabled: false,
    text: 'Я согласен на обработку персональных данных в соответствии с Политикой конфиденциальности'
  });

  useEffect(() => {
    loadGlobalSettings();
  }, []);

  const loadGlobalSettings = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(`${BACKEND_URLS.consentSettings}?action=global_consent_settings`);
      if (response.ok) {
        const data = await response.json();
        setGlobalSettings(data);
      }
    } catch (error) {
      console.error('Error loading consent settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить настройки согласия',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGlobalSettings = async () => {
    setIsSaving(true);
    try {
      const response = await authenticatedFetch(`${BACKEND_URLS.consentSettings}?action=global_consent_settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(globalSettings)
      });

      if (response.ok) {
        toast({
          title: 'Сохранено',
          description: 'Глобальные настройки согласия обновлены'
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

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
      <Card>
        <CardHeader>
          <CardTitle>Глобальные настройки согласия 152-ФЗ</CardTitle>
          <CardDescription>
            Эти настройки применяются по умолчанию ко всем новым проектам. Клиенты могут изменить их в своих настройках.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Включить согласие по умолчанию</Label>
              <p className="text-sm text-slate-600">
                Новые проекты будут создаваться с включенным согласием на обработку данных
              </p>
            </div>
            <Switch
              checked={globalSettings.enabled}
              onCheckedChange={(checked) => setGlobalSettings({ ...globalSettings, enabled: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label>Текст согласия по умолчанию</Label>
            <Textarea
              value={globalSettings.text}
              onChange={(e) => setGlobalSettings({ ...globalSettings, text: e.target.value })}
              rows={4}
              placeholder="Текст согласия на обработку персональных данных..."
            />
            <p className="text-xs text-slate-500">
              Этот текст будет показываться пользователям как чекбокс перед отправкой первого сообщения
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
              <div className="space-y-2 text-sm text-blue-900">
                <p className="font-semibold">Предварительный просмотр:</p>
                <div className="bg-white rounded p-3 border border-blue-200">
                  <div className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" disabled />
                    <span className="text-sm">{globalSettings.text}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleSaveGlobalSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <Icon name="Loader2" className="animate-spin mr-2" size={16} />
                Сохранение...
              </>
            ) : (
              <>
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить глобальные настройки
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Информация о 152-ФЗ</CardTitle>
          <CardDescription>Справка о законе о персональных данных</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              <strong>152-ФЗ</strong> — Федеральный закон Российской Федерации "О персональных данных".
            </p>
            <p>
              Закон требует получения явного согласия пользователя на обработку его персональных данных
              (имя, email, телефон и т.д.) перед их сбором и использованием.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded p-3">
              <p className="font-semibold text-amber-900 mb-2">Рекомендации:</p>
              <ul className="list-disc list-inside space-y-1 text-amber-900">
                <li>Всегда указывайте ссылку на Политику конфиденциальности</li>
                <li>Получайте согласие ДО сбора данных</li>
                <li>Храните подтверждения согласия пользователей</li>
                <li>Предоставляйте возможность отозвать согласие</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};