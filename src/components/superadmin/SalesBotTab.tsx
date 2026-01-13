import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { authenticatedFetch } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const BACKEND_URLS = {
  getAiSettings: 'https://functions.poehali.dev/aa4e850d-6e48-49a5-8ffd-473d4ffa4235',
  updateAiSettings: 'https://functions.poehali.dev/a3f5f302-e16a-4bb7-8530-d0f6cd22091f'
};

export const SalesBotTab = () => {
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSalesBotPrompt();
  }, []);

  const loadSalesBotPrompt = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(`${BACKEND_URLS.getAiSettings}?tenant_id=1`);
      const data = await response.json();
      
      if (data.settings && data.settings.system_prompt) {
        setSystemPrompt(data.settings.system_prompt);
      }
    } catch (error) {
      console.error('Error loading sales bot prompt:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить промпт бота',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await authenticatedFetch(BACKEND_URLS.updateAiSettings, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: 1,
          settings: {
            system_prompt: systemPrompt
          }
        })
      });

      if (response.ok) {
        toast({
          title: 'Сохранено!',
          description: 'Промпт бота-продажника обновлён'
        });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить промпт',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Bot" size={24} />
            Бот-продажник (Tenant ID: 1)
          </CardTitle>
          <CardDescription>
            Системный промпт для дефолтного бота отеля "Династия". Этот промпт копируется всем новым клиентам при создании.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Важно:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Этот промпт используется как шаблон для новых ботов</li>
                  <li>При создании нового тенанта через ЮKassa этот промпт копируется автоматически</li>
                  <li>Изменения не влияют на уже созданные боты</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sales_prompt">Системный промпт</Label>
            <Textarea
              id="sales_prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Загрузка промпта..."
              rows={25}
              className="font-mono text-sm"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{systemPrompt.length} символов</span>
              <span>{systemPrompt.split('\n').length} строк</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="flex-1"
            >
              <Icon name="Save" size={16} className="mr-2" />
              {isSaving ? 'Сохранение...' : 'Сохранить промпт'}
            </Button>
            <Button
              onClick={loadSalesBotPrompt}
              variant="outline"
              disabled={isLoading || isSaving}
            >
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Обновить
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-500 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Icon name="Zap" size={20} />
            Быстрые действия
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open('/default/admin', '_blank')}
          >
            <Icon name="ExternalLink" size={16} className="mr-2" />
            Открыть админку бота-продажника
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open('/default', '_blank')}
          >
            <Icon name="Eye" size={16} className="mr-2" />
            Посмотреть публичную страницу
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
