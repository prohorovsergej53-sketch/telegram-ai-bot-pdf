import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { BACKEND_URLS, AI_MODELS, DEFAULT_AI_SETTINGS, AiModelSettings } from './types';
import Icon from '@/components/ui/icon';

const AiSettingsCard = () => {
  const [selectedModel, setSelectedModel] = useState<string>('yandexgpt');
  const [settings, setSettings] = useState<AiModelSettings>(DEFAULT_AI_SETTINGS.yandexgpt);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(BACKEND_URLS.getAiSettings);
      const data = await response.json();
      if (data.settings) {
        setSelectedModel(data.settings.model);
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setSettings(DEFAULT_AI_SETTINGS[model as keyof typeof DEFAULT_AI_SETTINGS]);
  };

  const handleResetToDefaults = () => {
    setSettings(DEFAULT_AI_SETTINGS[selectedModel as keyof typeof DEFAULT_AI_SETTINGS]);
    toast({
      title: 'Сброшено',
      description: 'Настройки восстановлены по умолчанию'
    });
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(BACKEND_URLS.updateAiSettings, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Сохранено!',
          description: 'Настройки AI обновлены'
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось сохранить настройки',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentDefaults = DEFAULT_AI_SETTINGS[selectedModel as keyof typeof DEFAULT_AI_SETTINGS];
  const isDefaultSettings = JSON.stringify(settings) === JSON.stringify(currentDefaults);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Brain" size={24} />
          Настройки AI
        </CardTitle>
        <CardDescription>
          Параметры языковой модели для генерации ответов
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Модель</Label>
          <Select value={selectedModel} onValueChange={handleModelChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AI_MODELS.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Temperature</Label>
              <span className="text-sm text-slate-500">{settings.temperature}</span>
            </div>
            <Slider
              value={[settings.temperature]}
              onValueChange={(value) => setSettings({ ...settings, temperature: value[0] })}
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
            <p className="text-xs text-slate-500">
              {selectedModel === 'yandexgpt' 
                ? 'Рекомендуется 0.15 для минимума галлюцинаций при RAG'
                : 'Рекомендуется 0.2 для стабильных ответов'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Top P</Label>
              <span className="text-sm text-slate-500">{settings.top_p}</span>
            </div>
            <Slider
              value={[settings.top_p]}
              onValueChange={(value) => setSettings({ ...settings, top_p: value[0] })}
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
            <p className="text-xs text-slate-500">
              При низкой температуре влияет слабо, оставьте 1.0
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Max Tokens</Label>
              <span className="text-sm text-slate-500">{settings.max_tokens}</span>
            </div>
            <Slider
              value={[settings.max_tokens]}
              onValueChange={(value) => setSettings({ ...settings, max_tokens: value[0] })}
              min={100}
              max={1000}
              step={50}
              className="w-full"
            />
            <p className="text-xs text-slate-500">
              {selectedModel === 'yandexgpt'
                ? 'Рекомендуется 400-600, YandexGPT любит "растекаться"'
                : 'Максимальная длина ответа в токенах'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Frequency Penalty</Label>
              <span className="text-sm text-slate-500">{settings.frequency_penalty}</span>
            </div>
            <Slider
              value={[settings.frequency_penalty]}
              onValueChange={(value) => setSettings({ ...settings, frequency_penalty: value[0] })}
              min={0}
              max={2}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-slate-500">
              {selectedModel === 'yandexgpt'
                ? 'Рекомендуется 0 — повторы фраз нужны для шаблонов консьержа'
                : 'Штраф за частые повторы слов'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Presence Penalty</Label>
              <span className="text-sm text-slate-500">{settings.presence_penalty}</span>
            </div>
            <Slider
              value={[settings.presence_penalty]}
              onValueChange={(value) => setSettings({ ...settings, presence_penalty: value[0] })}
              min={0}
              max={2}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-slate-500">
              {selectedModel === 'yandexgpt'
                ? 'Рекомендуется 0 — консьерж не должен уходить в новые темы'
                : 'Штраф за повтор уже использованных тем'}
            </p>
          </div>

          {selectedModel === 'yandexgpt' && (
            <>
              <div className="space-y-2">
                <Label>System Priority</Label>
                <Select
                  value={settings.system_priority}
                  onValueChange={(value) => setSettings({ ...settings, system_priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strict">Strict (рекомендуется)</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Strict обязательно — защищает от выбивания промпта пользователем
                </p>
              </div>

              <div className="space-y-2">
                <Label>Creative Mode</Label>
                <Select
                  value={settings.creative_mode}
                  onValueChange={(value) => setSettings({ ...settings, creative_mode: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off (рекомендуется)</SelectItem>
                    <SelectItem value="on">On</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Выключите — нужен максимально инструктивный режим
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
          <Button
            onClick={handleResetToDefaults}
            variant="outline"
            disabled={isDefaultSettings}
          >
            Сбросить
          </Button>
        </div>

        {!isDefaultSettings && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <Icon name="AlertTriangle" size={16} className="inline mr-1" />
              Настройки отличаются от рекомендованных
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AiSettingsCard;
