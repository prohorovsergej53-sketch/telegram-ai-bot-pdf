import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { BACKEND_URLS, PageSettings, QuickQuestion } from './types';
import { authenticatedFetch, getTenantId } from '@/lib/auth';
import { HeaderSettingsSection } from './HeaderSettingsSection';
import { ChatSettingsSection } from './ChatSettingsSection';
import { ContactsSettingsSection } from './ContactsSettingsSection';
import { QuickQuestionsSection } from './QuickQuestionsSection';

const PageSettingsCard = () => {
  const [settings, setSettings] = useState<PageSettings>({
    header_icon: 'Hotel',
    header_title: 'Отель Пушкин',
    header_subtitle: 'AI Консьерж',
    page_title: 'Консьерж отеля',
    page_subtitle: 'Спросите о номерах, услугах и инфраструктуре',
    quick_questions_title: 'Быстрые вопросы',
    contacts_title: 'Контакты',
    contact_phone_label: 'Ресепшн',
    contact_phone_value: '+7 (495) 123-45-67',
    contact_email_label: 'Email',
    contact_email_value: 'info@hotel.ru',
    contact_address_label: 'Адрес',
    contact_address_value: 'Москва, ул. Примерная, 1',
    footer_text: 'Хочу такого бота!',
    footer_link: 'https://max.im/+79787236035',
    input_placeholder: 'Задайте вопрос...'
  });

  const [quickQuestions, setQuickQuestions] = useState<QuickQuestion[]>([
    { text: 'Номера', question: 'Какие номера доступны?', icon: 'Hotel' },
    { text: 'Услуги', question: 'Какие услуги предоставляет отель?', icon: 'Sparkles' },
    { text: 'Завтрак', question: 'Во сколько подают завтрак?', icon: 'Coffee' },
    { text: 'Бассейн', question: 'Есть ли бассейн?', icon: 'Waves' }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const tenantId = getTenantId();
      const url = tenantId ? `${BACKEND_URLS.getPageSettings}?tenant_id=${tenantId}` : BACKEND_URLS.getPageSettings;
      const response = await authenticatedFetch(url);
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
      }
      if (data.quickQuestions) {
        setQuickQuestions(data.quickQuestions);
      }
    } catch (error) {
      console.error('Error loading page settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(BACKEND_URLS.updatePageSettings, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, quickQuestions })
      });

      const data = await response.json();

      if (response.ok) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const tenantId = getTenantId();
        const verifyUrl = tenantId ? `${BACKEND_URLS.getPageSettings}?tenant_id=${tenantId}` : BACKEND_URLS.getPageSettings;
        const verifyResponse = await authenticatedFetch(verifyUrl);
        const verifyData = await verifyResponse.json();
        
        const savedCorrectly = 
          verifyData.settings?.header_title === settings.header_title &&
          verifyData.settings?.page_title === settings.page_title &&
          verifyData.settings?.contact_phone_value === settings.contact_phone_value &&
          verifyData.quickQuestions?.length === quickQuestions.length;
        
        if (savedCorrectly) {
          toast({
            title: '✓ Сохранено!',
            description: 'Настройки страницы успешно обновлены и проверены в базе данных'
          });
        } else {
          toast({
            title: '⚠️ Частично сохранено',
            description: 'Данные записаны, но проверка показала расхождения',
            variant: 'destructive'
          });
        }
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

  const handleAddQuestion = () => {
    setQuickQuestions([...quickQuestions, { text: 'Новый вопрос', question: '', icon: 'HelpCircle' }]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuickQuestions(quickQuestions.filter((_, i) => i !== index));
  };

  const handleUpdateQuestion = (index: number, field: keyof QuickQuestion, value: string) => {
    const updated = [...quickQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setQuickQuestions(updated);
  };

  const handleQuickQuestionsTitle = (title: string) => {
    setSettings({ ...settings, quick_questions_title: title });
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
        <CardTitle className="flex items-center gap-2">
          <Icon name="Layout" size={20} />
          Настройки страницы
        </CardTitle>
        <CardDescription>Тексты, контакты и быстрые вопросы</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <HeaderSettingsSection
            settings={settings}
            onSettingsChange={setSettings}
          />

          <ChatSettingsSection
            settings={settings}
            onSettingsChange={setSettings}
          />

          <ContactsSettingsSection
            settings={settings}
            onSettingsChange={setSettings}
          />

          <QuickQuestionsSection
            title={settings.quick_questions_title}
            questions={quickQuestions}
            onTitleChange={handleQuickQuestionsTitle}
            onAddQuestion={handleAddQuestion}
            onRemoveQuestion={handleRemoveQuestion}
            onUpdateQuestion={handleUpdateQuestion}
          />

          <div className="pt-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Футер</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="footer_text">Текст ссылки</Label>
                <Input
                  id="footer_text"
                  value={settings.footer_text}
                  onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="footer_link">URL ссылки</Label>
                <Input
                  id="footer_link"
                  value={settings.footer_link}
                  onChange={(e) => setSettings({ ...settings, footer_link: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSaveSettings} disabled={isLoading} size="lg">
            {isLoading ? (
              <>
                <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                Сохранение...
              </>
            ) : (
              <>
                <Icon name="Save" className="mr-2" size={16} />
                Сохранить настройки
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PageSettingsCard;
