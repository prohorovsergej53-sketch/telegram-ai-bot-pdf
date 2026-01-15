import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { authenticatedFetch } from '@/lib/auth';

const BACKEND_URL = 'https://functions.poehali.dev/2f7a79a2-87ef-4692-b9a6-1e23f408edaa';

interface FAQ {
  question: string;
  answer: string;
}

interface ConsentSettings {
  enabled: boolean;
  text: string;
}

const ContentEditor = () => {
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get('tenant_id');
  
  const [name, setName] = useState('');
  const [publicDescription, setPublicDescription] = useState('');
  const [welcomeText, setWelcomeText] = useState('');
  const [faq, setFaq] = useState<FAQ[]>([]);
  const [contactInfo, setContactInfo] = useState({ phone: '', email: '', address: '' });
  const [consentSettings, setConsentSettings] = useState<ConsentSettings>({
    enabled: false,
    text: 'Я согласен на обработку персональных данных в соответствии с Политикой конфиденциальности'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (tenantId) {
      loadContent();
    }
  }, [tenantId]);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(`${BACKEND_URL}?action=public_content&tenant_id=${tenantId}`);
      const data = await response.json();
      
      setName(data.name || '');
      setPublicDescription(data.public_description || '');
      setWelcomeText(data.welcome_text || '');
      setFaq(data.faq || []);
      setContactInfo(data.contact_info || { phone: '', email: '', address: '' });
      setConsentSettings(data.consent_settings || {
        enabled: false,
        text: 'Я согласен на обработку персональных данных в соответствии с Политикой конфиденциальности'
      });
    } catch (error) {
      console.error('Error loading content:', error);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить контент', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tenantId) {
      toast({ title: 'Ошибка', description: 'Не указан tenant_id', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const response = await authenticatedFetch(`${BACKEND_URL}?action=public_content&tenant_id=${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_description: publicDescription,
          welcome_text: welcomeText,
          faq,
          contact_info: contactInfo,
          consent_settings: consentSettings
        })
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'Контент сохранен' });
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const addFaqItem = () => {
    setFaq([...faq, { question: '', answer: '' }]);
  };

  const removeFaqItem = (index: number) => {
    setFaq(faq.filter((_, i) => i !== index));
  };

  const updateFaqItem = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faq];
    updated[index][field] = value;
    setFaq(updated);
  };

  if (!tenantId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Ошибка</CardTitle>
            <CardDescription>Не указан tenant_id в URL</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icon name="Loader2" className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{name}</h1>
          <p className="text-muted-foreground">Редактирование публичного контента</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Icon name="Loader2" className="animate-spin mr-2" size={16} />
              Сохранение...
            </>
          ) : (
            <>
              <Icon name="Save" className="mr-2" size={16} />
              Сохранить все
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Публичное описание</CardTitle>
          <CardDescription>Это описание будет видно всем посетителям</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={publicDescription}
            onChange={(e) => setPublicDescription(e.target.value)}
            rows={6}
            placeholder="Расскажите о вашем бизнесе..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Текст приветствия</CardTitle>
          <CardDescription>Приветственное сообщение для чата</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={welcomeText}
            onChange={(e) => setWelcomeText(e.target.value)}
            rows={4}
            placeholder="Здравствуйте! Чем могу помочь?"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Контактная информация</CardTitle>
          <CardDescription>Контакты для связи</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Телефон</Label>
            <Input
              value={contactInfo.phone}
              onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
              placeholder="+7 (999) 123-45-67"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={contactInfo.email}
              onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
              placeholder="info@example.com"
            />
          </div>
          <div>
            <Label>Адрес</Label>
            <Input
              value={contactInfo.address}
              onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
              placeholder="г. Москва, ул. Примерная, д. 1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Согласие на обработку данных (152-ФЗ)</CardTitle>
          <CardDescription>Настройки согласия пользователей в чате</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Требовать согласие перед чатом</Label>
              <p className="text-sm text-slate-600">
                Пользователь должен будет согласиться на обработку данных перед отправкой сообщения
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={consentSettings.enabled}
                onChange={(e) => setConsentSettings({ ...consentSettings, enabled: e.target.checked })}
                className="w-4 h-4"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Текст согласия</Label>
            <Textarea
              value={consentSettings.text}
              onChange={(e) => setConsentSettings({ ...consentSettings, text: e.target.value })}
              rows={3}
              placeholder="Текст согласия на обработку персональных данных..."
            />
            <p className="text-xs text-slate-500">
              Этот текст будет показан как чекбокс. Рекомендуется добавить ссылку на Политику конфиденциальности.
            </p>
          </div>

          {consentSettings.enabled && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
                <div className="space-y-2 text-sm text-blue-900">
                  <p className="font-semibold">Предварительный просмотр:</p>
                  <div className="bg-white rounded p-3 border border-blue-200">
                    <div className="flex items-start gap-2">
                      <input type="checkbox" className="mt-1" disabled />
                      <span className="text-sm">{consentSettings.text}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Часто задаваемые вопросы</CardTitle>
          <CardDescription>FAQ для посетителей</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faq.map((item, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <Label>Вопрос {index + 1}</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFaqItem(index)}
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
              <Input
                value={item.question}
                onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                placeholder="Вопрос..."
              />
              <Label>Ответ</Label>
              <Textarea
                value={item.answer}
                onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                rows={3}
                placeholder="Ответ..."
              />
            </div>
          ))}
          <Button onClick={addFaqItem} variant="outline" className="w-full">
            <Icon name="Plus" className="mr-2" size={16} />
            Добавить вопрос
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentEditor;