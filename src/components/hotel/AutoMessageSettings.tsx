import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BACKEND_URLS } from './types';
import { authenticatedFetch } from '@/lib/auth';

interface AutoMessageSettingsProps {
  isSuperAdmin: boolean;
}

interface AutoMessageConfig {
  auto_message_enabled: boolean;
  auto_message_delay_seconds: number;
  auto_message_text: string;
  auto_message_repeat: boolean;
  auto_message_repeat_delay_seconds: number;
}

const AutoMessageSettings = ({ isSuperAdmin }: AutoMessageSettingsProps) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<AutoMessageConfig>({
    auto_message_enabled: false,
    auto_message_delay_seconds: 30,
    auto_message_text: 'Могу помочь с выбором? 😊',
    auto_message_repeat: true,
    auto_message_repeat_delay_seconds: 60
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isSuperAdmin) {
      loadSettings();
    }
  }, [isSuperAdmin]);

  const loadSettings = async () => {
    try {
      const response = await authenticatedFetch(BACKEND_URLS.getWidgetSettings);
      const data = await response.json();
      setConfig({
        auto_message_enabled: data.auto_message_enabled ?? false,
        auto_message_delay_seconds: data.auto_message_delay_seconds ?? 30,
        auto_message_text: data.auto_message_text ?? 'Могу помочь с выбором? 😊',
        auto_message_repeat: data.auto_message_repeat ?? true,
        auto_message_repeat_delay_seconds: data.auto_message_repeat_delay_seconds ?? 60
      });
    } catch (error) {
      console.error('Error loading auto-message settings:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(BACKEND_URLS.updateWidgetSettings, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        toast({
          title: '✓ Сохранено!',
          description: 'Настройки автосообщений обновлены'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <Card className="shadow-xl border-2 border-purple-200">
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center gap-2">
          <Icon name="Clock" size={20} />
          Автосообщения (SuperAdmin)
        </CardTitle>
        <CardDescription>
          Отправка сообщений при бездействии пользователя в чате
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={18} className="text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Как работает</p>
              <p>При открытии чата и после каждого сообщения пользователя запускается таймер. Если пользователь не пишет указанное время — бот отправляет автосообщение.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div>
            <Label htmlFor="enabled" className="text-base font-semibold">
              Включить автосообщения
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Активировать таймер бездействия
            </p>
          </div>
          <Switch
            id="enabled"
            checked={config.auto_message_enabled}
            onCheckedChange={(checked) =>
              setConfig({ ...config, auto_message_enabled: checked })
            }
          />
        </div>

        {config.auto_message_enabled && (
          <div className="space-y-4 border-l-4 border-purple-300 pl-4">
            <div>
              <Label htmlFor="delay">Задержка первого сообщения (сек)</Label>
              <Input
                id="delay"
                type="number"
                min="5"
                max="300"
                value={config.auto_message_delay_seconds}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    auto_message_delay_seconds: Number(e.target.value)
                  })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Рекомендуется 20-60 секунд
              </p>
            </div>

            <div>
              <Label htmlFor="message">Текст автосообщения</Label>
              <Textarea
                id="message"
                value={config.auto_message_text}
                onChange={(e) =>
                  setConfig({ ...config, auto_message_text: e.target.value })
                }
                rows={3}
                placeholder="Могу помочь с выбором? 😊"
              />
              <p className="text-xs text-gray-500 mt-1">
                Поддерживаются эмодзи
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <Label htmlFor="repeat" className="text-base">
                  Повторять автосообщения
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Если пользователь продолжает молчать
                </p>
              </div>
              <Switch
                id="repeat"
                checked={config.auto_message_repeat}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, auto_message_repeat: checked })
                }
              />
            </div>

            {config.auto_message_repeat && (
              <div>
                <Label htmlFor="repeat-delay">
                  Интервал повторных сообщений (сек)
                </Label>
                <Input
                  id="repeat-delay"
                  type="number"
                  min="30"
                  max="600"
                  value={config.auto_message_repeat_delay_seconds}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      auto_message_repeat_delay_seconds: Number(e.target.value)
                    })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Рекомендуется 60-120 секунд
                </p>
              </div>
            )}
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          <Icon name="Save" size={18} className="mr-2" />
          {isLoading ? 'Сохранение...' : 'Сохранить настройки автосообщений'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AutoMessageSettings;
