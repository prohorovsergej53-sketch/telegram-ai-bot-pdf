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
  webchat_enabled: boolean;
  messenger_enabled: boolean;
  text: string;
  messenger_text: string;
  privacy_policy_text: string;
}

interface ConsentSettingsCardProps {
  tenantId: number;
  fz152Enabled?: boolean;
}

const DEFAULT_PRIVACY_POLICY = `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h1 style="color: #2563eb; margin-bottom: 20px;">Политика конфиденциальности</h1>
  
  <h2 style="color: #1e40af; margin-top: 30px; margin-bottom: 15px;">1. Общие положения</h2>
  <p>Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей при использовании сервисов нашей компании.</p>
  
  <h2 style="color: #1e40af; margin-top: 30px; margin-bottom: 15px;">2. Собираемые данные</h2>
  <p>Мы собираем следующие категории персональных данных:</p>
  <ul style="margin-left: 20px;">
    <li>Имя и контактные данные (телефон, email)</li>
    <li>Данные об использовании сервиса (история сообщений, запросы)</li>
    <li>Техническая информация (IP-адрес, тип устройства, браузер)</li>
  </ul>
  
  <h2 style="color: #1e40af; margin-top: 30px; margin-bottom: 15px;">3. Цели обработки данных</h2>
  <p>Ваши персональные данные обрабатываются в следующих целях:</p>
  <ul style="margin-left: 20px;">
    <li>Предоставление услуг и консультаций</li>
    <li>Улучшение качества обслуживания</li>
    <li>Коммуникация с пользователями</li>
    <li>Выполнение требований законодательства</li>
  </ul>
  
  <h2 style="color: #1e40af; margin-top: 30px; margin-bottom: 15px;">4. Сроки хранения</h2>
  <p>Персональные данные хранятся в течение срока, необходимого для достижения целей обработки, но не более 5 лет с момента последнего обращения.</p>
  
  <h2 style="color: #1e40af; margin-top: 30px; margin-bottom: 15px;">5. Права субъектов данных</h2>
  <p>Вы имеете право:</p>
  <ul style="margin-left: 20px;">
    <li>Получать информацию об обработке ваших данных</li>
    <li>Требовать уточнения, блокирования или удаления данных</li>
    <li>Отозвать согласие на обработку данных</li>
    <li>Обжаловать действия в Роскомнадзоре</li>
  </ul>
  
  <h2 style="color: #1e40af; margin-top: 30px; margin-bottom: 15px;">6. Контактная информация</h2>
  <p>По вопросам обработки персональных данных обращайтесь:</p>
  <p style="margin-left: 20px;">
    <strong>Email:</strong> support@example.com<br>
    <strong>Телефон:</strong> +7 (XXX) XXX-XX-XX
  </p>
  
  <p style="margin-top: 30px; color: #64748b; font-size: 14px;">Дата последнего обновления: ${new Date().toLocaleDateString('ru-RU')}</p>
</div>`;

export const ConsentSettingsCard = ({ tenantId, fz152Enabled = false }: ConsentSettingsCardProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [fz152Status, setFz152Status] = useState(fz152Enabled);
  const [consentSettings, setConsentSettings] = useState<ConsentSettings>({
    webchat_enabled: false,
    messenger_enabled: false,
    text: 'Я согласен на обработку персональных данных в соответствии с <a href="/privacy-policy" target="_blank" class="text-primary underline">Политикой конфиденциальности</a>',
    messenger_text: 'Продолжая диалог, вы соглашаетесь на обработку персональных данных согласно нашей Политике конфиденциальности.',
    privacy_policy_text: DEFAULT_PRIVACY_POLICY
  });

  useEffect(() => {
    loadSettings();
  }, [tenantId]);

  useEffect(() => {
    setFz152Status(fz152Enabled);
  }, [fz152Enabled]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(`${BACKEND_URLS.manageConsentSettings}?action=public_content&tenant_id=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.consent_settings) {
          setConsentSettings({
            ...data.consent_settings,
            privacy_policy_text: data.consent_settings.privacy_policy_text || DEFAULT_PRIVACY_POLICY
          });
        }
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

  const handleToggleFz152 = async (enabled: boolean) => {
    setIsToggling(true);
    try {
      const response = await authenticatedFetch(`${BACKEND_URLS.manageConsentSettings}?action=toggle_fz152`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });

      if (response.ok) {
        setFz152Status(enabled);
        toast({
          title: enabled ? '152-ФЗ включен' : '152-ФЗ отключен',
          description: enabled 
            ? 'Теперь можно настроить тексты согласия и политику конфиденциальности' 
            : 'Согласие на обработку данных больше не запрашивается'
        });
        window.location.reload();
      } else {
        throw new Error('Failed to toggle 152-ФЗ');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить статус 152-ФЗ',
        variant: 'destructive'
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await authenticatedFetch(`${BACKEND_URLS.manageConsentSettings}?action=public_content&tenant_id=${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent_settings: consentSettings
        })
      });

      if (response.ok) {
        toast({
          title: 'Сохранено',
          description: 'Настройки согласия обновлены'
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="ShieldCheck" size={24} />
          Согласие на обработку данных (152-ФЗ)
        </CardTitle>
        <CardDescription>
          Включите 152-ФЗ для запроса согласия на обработку персональных данных
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
          <div className="space-y-2">
            <Label className="text-xl font-bold text-blue-900">Статус 152-ФЗ</Label>
            <p className="text-sm text-slate-600 max-w-xl">
              {fz152Status 
                ? 'Согласие на обработку данных активно. Посетители увидят чекбокс и текст согласия.' 
                : 'Согласие на обработку данных отключено. Включите для соответствия законодательству РФ.'}
            </p>
          </div>
          <Switch
            checked={fz152Status}
            onCheckedChange={handleToggleFz152}
            disabled={isToggling}
            className="scale-125"
          />
        </div>

        {!fz152Status && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold mb-2">Зачем нужен 152-ФЗ?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Соответствие законодательству РФ о защите персональных данных</li>
                  <li>Защита прав пользователей при сборе их данных</li>
                  <li>Повышение доверия клиентов к вашему сервису</li>
                  <li>Избежание штрафов от Роскомнадзора</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {fz152Status && (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">Согласие в веб-чате</Label>
                  <p className="text-sm text-slate-600">
                    Посетители увидят чекбокс перед первым сообщением
                  </p>
                </div>
                <Switch
                  checked={consentSettings.webchat_enabled}
                  onCheckedChange={(checked) => setConsentSettings({ ...consentSettings, webchat_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">Согласие в мессенджерах</Label>
                  <p className="text-sm text-slate-600">
                    Текст будет добавлен в первое сообщение Telegram/VK/MAX
                  </p>
                </div>
                <Switch
                  checked={consentSettings.messenger_enabled}
                  onCheckedChange={(checked) => setConsentSettings({ ...consentSettings, messenger_enabled: checked })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Текст согласия для веб-чата</Label>
              <Textarea
                value={consentSettings.text}
                onChange={(e) => setConsentSettings({ ...consentSettings, text: e.target.value })}
                rows={4}
                placeholder="Текст согласия на обработку персональных данных..."
              />
              <p className="text-xs text-slate-500">
                Поддерживается HTML. Ссылка относительная: &lt;a href="/privacy-policy" target="_blank"&gt;Политика конфиденциальности&lt;/a&gt; (автоматически привяжется к вашему боту)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Текст для мессенджеров (Telegram, VK, MAX)</Label>
              <Textarea
                value={consentSettings.messenger_text}
                onChange={(e) => setConsentSettings({ ...consentSettings, messenger_text: e.target.value })}
                rows={3}
                placeholder="Продолжая диалог, вы соглашаетесь на обработку персональных данных..."
              />
              <p className="text-xs text-slate-500">
                Этот текст будет добавлен в первое приветственное сообщение бота в мессенджерах.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Icon name="FileText" size={18} />
                Политика конфиденциальности
              </Label>
              <Textarea
                value={consentSettings.privacy_policy_text}
                onChange={(e) => setConsentSettings({ ...consentSettings, privacy_policy_text: e.target.value })}
                rows={12}
                placeholder="Введите текст Политики конфиденциальности..."
                className="font-mono text-xs"
              />
              <p className="text-xs text-slate-500">
                Этот текст будет отображаться на странице /privacy-policy. Поддерживается HTML для форматирования. Обязательно укажите ваши реальные контактные данные и реквизиты компании.
              </p>
            </div>

            {(consentSettings.webchat_enabled || consentSettings.messenger_enabled) && (
              <div className="space-y-4">
                {consentSettings.webchat_enabled && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
                      <div className="space-y-2 text-sm text-blue-900">
                        <p className="font-semibold">Предварительный просмотр (веб-чат):</p>
                        <div className="bg-white rounded p-3 border border-blue-200">
                          <div className="flex items-start gap-2">
                            <input type="checkbox" className="mt-1" disabled />
                            <span className="text-sm" dangerouslySetInnerHTML={{ __html: consentSettings.text }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {consentSettings.messenger_enabled && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Icon name="MessageSquare" size={20} className="text-green-600 mt-0.5" />
                      <div className="space-y-2 text-sm text-green-900">
                        <p className="font-semibold">Предварительный просмотр (мессенджер):</p>
                        <div className="bg-white rounded p-3 border border-green-200">
                          <p className="text-sm mb-2">👋 Здравствуйте! Чем могу помочь?</p>
                          <p className="text-xs text-slate-600 italic">{consentSettings.messenger_text}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button onClick={handleSave} disabled={isSaving} className="w-full" size="lg">
              {isSaving ? (
                <>
                  <Icon name="Loader2" className="animate-spin mr-2" size={16} />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить настройки
                </>
              )}
            </Button>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="AlertCircle" size={20} className="text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold mb-2">Важно о 152-ФЗ:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Требуйте согласие ДО сбора персональных данных</li>
                    <li>Обязательно заполните Политику конфиденциальности</li>
                    <li>Укажите в политике ваши реальные данные (ИНН, адрес, контакты)</li>
                    <li>Пользователи могут просмотреть политику по ссылке /privacy-policy</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsentSettingsCard;
