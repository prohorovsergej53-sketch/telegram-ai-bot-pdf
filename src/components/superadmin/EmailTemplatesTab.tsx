import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authenticatedFetch } from '@/lib/auth';
import Icon from '@/components/ui/icon';
import { BACKEND_URLS } from './types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EmailTemplate {
  id: number;
  template_key: string;
  subject: string;
  body: string;
  description: string;
  updated_at: string;
}

export const EmailTemplatesTab = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testVariables, setTestVariables] = useState<Record<string, string>>({});
  const [showVariablesEditor, setShowVariablesEditor] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ template_key: '', subject: '', body: '', description: '' });
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'code' | 'visual'>('visual');
  const bodyInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      console.log('Loading templates from:', BACKEND_URLS.emailTemplates);
      const response = await authenticatedFetch(BACKEND_URLS.emailTemplates);
      console.log('Response received:', response.status, response.ok);
      if (response.ok) {
        const data = await response.json();
        console.log('Data received:', data);
        setTemplates(data.templates || []);
        if (data.templates.length > 0 && !selectedTemplate) {
          setSelectedTemplate(data.templates[0]);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Server error:', response.status, errorData);
        toast({
          title: 'Ошибка сервера',
          description: errorData.error || `Статус: ${response.status}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось загрузить шаблоны',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    
    setIsSaving(true);
    try {
      const response = await authenticatedFetch(BACKEND_URLS.emailTemplates, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedTemplate.id,
          subject: selectedTemplate.subject,
          body: selectedTemplate.body
        })
      });

      if (response.ok) {
        toast({
          title: 'Сохранено',
          description: 'Шаблон письма успешно обновлён'
        });
        loadTemplates();
      } else {
        throw new Error('Failed to save template');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить шаблон',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!selectedTemplate || !testEmail) {
      toast({
        title: 'Ошибка',
        description: 'Укажите email для отправки',
        variant: 'destructive'
      });
      return;
    }

    setIsSendingTest(true);
    try {
      const isSubscriptionReminder = selectedTemplate.template_key.startsWith('subscription_reminder_');
      
      const defaultData = isSubscriptionReminder 
        ? {
            tenant_name: 'Тестовый проект',
            tariff_name: 'Бизнес',
            renewal_price: '7990.00',
            renewal_url: 'https://example.com/content-editor?tenant_id=123'
          }
        : {
            email: 'test@example.com',
            password: 'demo123456',
            login_url: 'https://example.com/login'
          };
      
      const testData = Object.keys(testVariables).length > 0 
        ? { ...defaultData, ...testVariables }
        : defaultData;

      const response = await authenticatedFetch(BACKEND_URLS.emailTemplates, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          template_id: selectedTemplate.id,
          test_email: testEmail,
          test_data: testData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Отправлено',
          description: `Тестовое письмо отправлено на ${testEmail}`
        });
      } else {
        throw new Error(data.error || 'Failed to send test email');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось отправить тестовое письмо',
        variant: 'destructive'
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const insertVariable = (variable: string) => {
    if (!selectedTemplate) return;
    
    const textarea = bodyInputRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = selectedTemplate.body;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + `{{ ${variable} }}` + after;
      
      setSelectedTemplate({ ...selectedTemplate, body: newText });
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 6, start + variable.length + 6);
      }, 0);
    }
  };

  const getAvailableVariables = () => {
    if (!selectedTemplate) return [];
    
    if (selectedTemplate.template_key.startsWith('subscription_reminder_')) {
      return ['tenant_name', 'tariff_name', 'renewal_price', 'renewal_url'];
    }
    return ['email', 'password', 'login_url', 'tariff_name'];
  };

  const renderPreview = () => {
    if (!selectedTemplate) return { html: '', subject: '' };
    
    const testData = selectedTemplate.template_key.startsWith('subscription_reminder_') 
      ? {
          tenant_name: testVariables.tenant_name || 'Тестовый проект',
          tariff_name: testVariables.tariff_name || 'Бизнес',
          renewal_price: testVariables.renewal_price || '7990.00',
          renewal_url: testVariables.renewal_url || 'https://example.com/content-editor?tenant_id=123'
        }
      : {
          email: testVariables.email || 'test@example.com',
          password: testVariables.password || 'demo123456',
          login_url: testVariables.login_url || 'https://example.com/admin-login',
          tariff_name: testVariables.tariff_name || 'Базовый'
        };
    
    let html = selectedTemplate.body;
    let subject = selectedTemplate.subject;
    
    Object.entries(testData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      html = html.replace(regex, value);
      subject = subject.replace(regex, value);
    });
    
    return { html, subject };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Icon name="Loader2" className="animate-spin mx-auto mb-2" size={32} />
          <p className="text-slate-600">Загрузка шаблонов...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Шаблоны писем</CardTitle>
          <CardDescription>Выберите шаблон для редактирования</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start border-dashed"
              onClick={() => {
                setIsCreating(true);
                setSelectedTemplate(null);
              }}
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Создать новый шаблон
            </Button>
            {templates.map((template) => (
              <Button
                key={template.id}
                variant={selectedTemplate?.id === template.id ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => {
                  setSelectedTemplate(template);
                  setIsCreating(false);
                }}
              >
                <Icon name="Mail" size={16} className="mr-2" />
                <div className="text-left">
                  <div className="font-medium">{template.template_key}</div>
                  <div className="text-xs opacity-70">{template.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {isCreating && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Создание нового шаблона</CardTitle>
            <CardDescription>Добавьте новый email-шаблон для рассылок</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Ключ шаблона (латиница, нижнее_подчёркивание)</Label>
              <Input
                value={newTemplate.template_key}
                onChange={(e) => setNewTemplate({ ...newTemplate, template_key: e.target.value })}
                placeholder="subscription_renewal"
              />
            </div>

            <div className="space-y-2">
              <Label>Описание</Label>
              <Input
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                placeholder="Письмо о продлении подписки"
              />
            </div>

            <div className="space-y-2">
              <Label>Тема письма</Label>
              <Input
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                placeholder="Напоминание о продлении подписки"
              />
            </div>

            <div className="space-y-2">
              <Label>Текст письма (HTML)</Label>
              <Textarea
                value={newTemplate.body}
                onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                placeholder="<h1>Здравствуйте!</h1><p>Ваша подписка истекает...</p>"
                rows={15}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    const response = await authenticatedFetch(BACKEND_URLS.emailTemplates, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'create',
                        ...newTemplate
                      })
                    });

                    if (response.ok) {
                      toast({
                        title: 'Создано',
                        description: 'Новый шаблон успешно создан'
                      });
                      setIsCreating(false);
                      setNewTemplate({ template_key: '', subject: '', body: '', description: '' });
                      loadTemplates();
                    } else {
                      throw new Error('Failed to create template');
                    }
                  } catch (error) {
                    toast({
                      title: 'Ошибка',
                      description: 'Не удалось создать шаблон',
                      variant: 'destructive'
                    });
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving || !newTemplate.template_key || !newTemplate.subject || !newTemplate.body}
              >
                {isSaving ? (
                  <>
                    <Icon name="Loader2" className="animate-spin mr-2" size={16} />
                    Создание...
                  </>
                ) : (
                  <>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Создать шаблон
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => {
                setIsCreating(false);
                setNewTemplate({ template_key: '', subject: '', body: '', description: '' });
              }}>
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTemplate && !isCreating && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Редактирование: {selectedTemplate.template_key}</CardTitle>
            <CardDescription>{selectedTemplate.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Тема письма</Label>
              <Input
                value={selectedTemplate.subject}
                onChange={(e) => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })}
                placeholder="Тема письма"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Текст письма (HTML)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(true)}
                >
                  <Icon name="Eye" size={14} className="mr-1" />
                  Предпросмотр
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {getAvailableVariables().map((variable) => (
                  <Button
                    key={variable}
                    variant="secondary"
                    size="sm"
                    onClick={() => insertVariable(variable)}
                  >
                    <Icon name="Plus" size={12} className="mr-1" />
                    {variable}
                  </Button>
                ))}
              </div>
              
              <Textarea
                ref={bodyInputRef}
                value={selectedTemplate.body}
                onChange={(e) => setSelectedTemplate({ ...selectedTemplate, body: e.target.value })}
                placeholder="HTML код письма"
                rows={15}
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-500">
                Нажмите на переменную выше, чтобы вставить её в нужное место
              </p>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Icon name="Loader2" className="animate-spin mr-2" size={16} />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Icon name="Save" size={16} className="mr-2" />
                    Сохранить
                  </>
                )}
              </Button>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label>Отправить тестовое письмо</Label>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowVariablesEditor(!showVariablesEditor)}
                >
                  <Icon name="Settings" size={14} className="mr-1" />
                  Настроить переменные
                </Button>
              </div>
              
              {showVariablesEditor && (
                <div className="bg-slate-50 p-4 rounded-lg space-y-3 border">
                  <p className="text-xs text-slate-600 font-medium">Тестовые значения переменных:</p>
                  {selectedTemplate.template_key.startsWith('subscription_reminder_') ? (
                    <>
                      <div>
                        <Label className="text-xs">tenant_name</Label>
                        <Input
                          value={testVariables.tenant_name || 'Тестовый проект'}
                          onChange={(e) => setTestVariables({...testVariables, tenant_name: e.target.value})}
                          placeholder="Название проекта"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">tariff_name</Label>
                        <Input
                          value={testVariables.tariff_name || 'Бизнес'}
                          onChange={(e) => setTestVariables({...testVariables, tariff_name: e.target.value})}
                          placeholder="Название тарифа"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">renewal_price</Label>
                        <Input
                          value={testVariables.renewal_price || '7990.00'}
                          onChange={(e) => setTestVariables({...testVariables, renewal_price: e.target.value})}
                          placeholder="Цена продления"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">renewal_url</Label>
                        <Input
                          value={testVariables.renewal_url || 'https://example.com/content-editor?tenant_id=123'}
                          onChange={(e) => setTestVariables({...testVariables, renewal_url: e.target.value})}
                          placeholder="Ссылка для продления"
                          className="mt-1"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label className="text-xs">email</Label>
                        <Input
                          value={testVariables.email || 'test@example.com'}
                          onChange={(e) => setTestVariables({...testVariables, email: e.target.value})}
                          placeholder="Email пользователя"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">password</Label>
                        <Input
                          value={testVariables.password || 'demo123456'}
                          onChange={(e) => setTestVariables({...testVariables, password: e.target.value})}
                          placeholder="Пароль"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">login_url</Label>
                        <Input
                          value={testVariables.login_url || 'https://example.com/login'}
                          onChange={(e) => setTestVariables({...testVariables, login_url: e.target.value})}
                          placeholder="Ссылка для входа"
                          className="mt-1"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="email@example.com"
                />
                <Button onClick={handleSendTest} disabled={isSendingTest} variant="outline">
                  {isSendingTest ? (
                    <>
                      <Icon name="Loader2" className="animate-spin mr-2" size={16} />
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Icon name="Send" size={16} className="mr-2" />
                      Отправить
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Письмо будет отправлено с тестовыми данными для проверки
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Предпросмотр письма</DialogTitle>
          </DialogHeader>
          
          <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as 'code' | 'visual')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="visual">
                <Icon name="Eye" size={14} className="mr-2" />
                Визуальный вид
              </TabsTrigger>
              <TabsTrigger value="code">
                <Icon name="Code" size={14} className="mr-2" />
                HTML код
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="visual" className="space-y-4">
              <div className="border-b pb-4">
                <p className="text-sm text-slate-600 mb-2">Тема письма:</p>
                <p className="text-lg font-semibold">{renderPreview().subject}</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-white">
                <iframe
                  srcDoc={renderPreview().html}
                  className="w-full border-0"
                  style={{ minHeight: '500px', height: 'auto' }}
                  title="Email Preview"
                />
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  <Icon name="Info" size={14} className="inline mr-1" />
                  Предпросмотр использует тестовые значения переменных. Для изменения значений используйте редактор переменных при отправке тестового письма.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="code">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-slate-600">Тема письма:</Label>
                  <pre className="mt-2 p-4 bg-slate-50 rounded-lg text-sm overflow-x-auto">
                    {renderPreview().subject}
                  </pre>
                </div>
                
                <div>
                  <Label className="text-sm text-slate-600">HTML код с подставленными значениями:</Label>
                  <pre className="mt-2 p-4 bg-slate-50 rounded-lg text-sm overflow-x-auto font-mono">
                    {renderPreview().html}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};