import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import IconPicker from './IconPicker';
import { useToast } from '@/hooks/use-toast';
import { BACKEND_URLS, PageSettings, QuickQuestion } from './types';

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
      const response = await fetch(BACKEND_URLS.getPageSettings);
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
      const response = await fetch(BACKEND_URLS.updatePageSettings, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, quickQuestions })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Сохранено!',
          description: 'Настройки страницы обновлены'
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
          <div className="border-b pb-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Шапка страницы</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="header_icon">Иконка</Label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={settings.header_icon} size={20} className="text-primary" />
                  </div>
                  <IconPicker
                    selectedIcon={settings.header_icon}
                    onSelectIcon={(icon) => setSettings({ ...settings, header_icon: icon })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="header_title">Название</Label>
                <Input
                  id="header_title"
                  value={settings.header_title}
                  onChange={(e) => setSettings({ ...settings, header_title: e.target.value })}
                  placeholder="Отель Пушкин"
                />
              </div>
              <div>
                <Label htmlFor="header_subtitle">Слоган</Label>
                <Input
                  id="header_subtitle"
                  value={settings.header_subtitle}
                  onChange={(e) => setSettings({ ...settings, header_subtitle: e.target.value })}
                  placeholder="AI Консьерж"
                />
              </div>
            </div>
          </div>

          <div className="border-b pb-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Заголовки чата</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="page_title">Заголовок чата</Label>
                <Input
                  id="page_title"
                  value={settings.page_title}
                  onChange={(e) => setSettings({ ...settings, page_title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="page_subtitle">Подзаголовок чата</Label>
                <Input
                  id="page_subtitle"
                  value={settings.page_subtitle}
                  onChange={(e) => setSettings({ ...settings, page_subtitle: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="input_placeholder">Текст в поле ввода</Label>
                <Input
                  id="input_placeholder"
                  value={settings.input_placeholder}
                  onChange={(e) => setSettings({ ...settings, input_placeholder: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="border-b pb-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Контакты</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="contact_phone_label">Название телефона</Label>
                  <Input
                    id="contact_phone_label"
                    value={settings.contact_phone_label}
                    onChange={(e) => setSettings({ ...settings, contact_phone_label: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone_value">Номер телефона</Label>
                  <Input
                    id="contact_phone_value"
                    value={settings.contact_phone_value}
                    onChange={(e) => setSettings({ ...settings, contact_phone_value: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="contact_email_label">Название email</Label>
                  <Input
                    id="contact_email_label"
                    value={settings.contact_email_label}
                    onChange={(e) => setSettings({ ...settings, contact_email_label: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email_value">Email адрес</Label>
                  <Input
                    id="contact_email_value"
                    value={settings.contact_email_value}
                    onChange={(e) => setSettings({ ...settings, contact_email_value: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="contact_address_label">Название адреса</Label>
                  <Input
                    id="contact_address_label"
                    value={settings.contact_address_label}
                    onChange={(e) => setSettings({ ...settings, contact_address_label: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_address_value">Адрес</Label>
                  <Input
                    id="contact_address_value"
                    value={settings.contact_address_value}
                    onChange={(e) => setSettings({ ...settings, contact_address_value: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Быстрые вопросы</h3>
              <Button onClick={handleAddQuestion} size="sm" variant="outline">
                <Icon name="Plus" size={16} className="mr-1" />
                Добавить
              </Button>
            </div>
            <div className="space-y-2">
              {quickQuestions.map((q, idx) => (
                <div key={idx} className="border rounded-lg p-3 space-y-2 bg-slate-50">
                  <div className="grid grid-cols-[1fr_auto_40px] gap-2">
                    <Input
                      placeholder="Текст кнопки"
                      value={q.text}
                      onChange={(e) => handleUpdateQuestion(idx, 'text', e.target.value)}
                    />
                    <div className="w-[180px]">
                      <IconPicker
                        value={q.icon}
                        onChange={(value) => handleUpdateQuestion(idx, 'icon', value)}
                      />
                    </div>
                    <Button
                      onClick={() => handleRemoveQuestion(idx)}
                      size="icon"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                  <Input
                    placeholder="Вопрос, который отправится боту"
                    value={q.question}
                    onChange={(e) => handleUpdateQuestion(idx, 'question', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Подвал (ссылка на создателя)</h3>
            <div className="space-y-2">
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
                  placeholder="https://max.im/+79787236035"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleSaveSettings} disabled={isLoading} className="w-full">
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
      </CardContent>
    </Card>
  );
};

export default PageSettingsCard;