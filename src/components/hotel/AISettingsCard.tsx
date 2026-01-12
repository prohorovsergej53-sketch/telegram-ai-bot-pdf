import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface AISettings {
  chat_provider: string;
  chat_model: string;
  embedding_provider: string;
  embedding_model: string;
}

interface AISettingsCardProps {
  getSettingsUrl: string;
  updateSettingsUrl: string;
}

const AISettingsCard = ({ getSettingsUrl, updateSettingsUrl }: AISettingsCardProps) => {
  const [settings, setSettings] = useState<AISettings>({
    chat_provider: 'deepseek',
    chat_model: 'deepseek-chat',
    embedding_provider: 'openai',
    embedding_model: 'text-embedding-3-small'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(getSettingsUrl);
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(updateSettingsUrl, {
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

  const chatModels = {
    deepseek: ['deepseek-chat', 'deepseek-reasoner'],
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo']
  };

  const embeddingModels = {
    openai: ['text-embedding-3-small', 'text-embedding-3-large', 'text-embedding-ada-002']
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
        <CardTitle className="flex items-center gap-2">
          <Icon name="Settings" size={20} />
          Настройки AI
        </CardTitle>
        <CardDescription>Выбор провайдеров и моделей для чата и эмбеддингов</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Провайдер чата
            </label>
            <Select
              value={settings.chat_provider}
              onValueChange={(value) => {
                setSettings({
                  ...settings,
                  chat_provider: value,
                  chat_model: chatModels[value as keyof typeof chatModels][0]
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deepseek">DeepSeek (дешевле)</SelectItem>
                <SelectItem value="openai">OpenAI (качественнее)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Модель чата
            </label>
            <Select
              value={settings.chat_model}
              onValueChange={(value) => setSettings({ ...settings, chat_model: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chatModels[settings.chat_provider as keyof typeof chatModels].map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-4">
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Провайдер эмбеддингов
            </label>
            <Select
              value={settings.embedding_provider}
              onValueChange={(value) => {
                setSettings({
                  ...settings,
                  embedding_provider: value,
                  embedding_model: embeddingModels[value as keyof typeof embeddingModels][0]
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI (только они поддерживают)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Модель эмбеддингов
            </label>
            <Select
              value={settings.embedding_model}
              onValueChange={(value) => setSettings({ ...settings, embedding_model: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {embeddingModels[settings.embedding_provider as keyof typeof embeddingModels].map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить настройки
              </>
            )}
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-2">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Рекомендации:</p>
              <ul className="text-blue-800 mt-2 space-y-1 list-disc list-inside">
                <li>DeepSeek в 50 раз дешевле OpenAI</li>
                <li>OpenAI — качественнее для сложных запросов</li>
                <li>Эмбеддинги только через OpenAI</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AISettingsCard;
