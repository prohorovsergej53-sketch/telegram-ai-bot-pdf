import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import GuestView from '@/components/hotel/GuestView';
import AdminView from '@/components/hotel/AdminView';
import AdminLoginForm from '@/components/hotel/AdminLoginForm';
import { Message, Document, BACKEND_URLS, PageSettings, QuickQuestion } from '@/components/hotel/types';
import { isAuthenticated, logout, authenticatedFetch, getTenantId, isSuperAdmin } from '@/lib/auth';

const Index = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const location = useLocation();
  const [view, setView] = useState<'guest' | 'admin'>('guest');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentTenantId, setCurrentTenantId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: 'Здравствуйте! Я ваш виртуальный помощник. Чем могу помочь?', 
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [pageSettings, setPageSettings] = useState<PageSettings | undefined>();
  const [quickQuestions, setQuickQuestions] = useState<QuickQuestion[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated()) {
      setIsAdminAuthenticated(true);
    }
    if (location.pathname.endsWith('/admin')) {
      setView('admin');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (tenantSlug) {
      loadTenantInfo();
    }
  }, [tenantSlug]);

  useEffect(() => {
    loadPageSettings();
  }, [currentTenantId]);

  useEffect(() => {
    if (view === 'admin' && isAdminAuthenticated) {
      loadDocuments();
    }
  }, [view, isAdminAuthenticated, currentTenantId]);

  const loadTenantInfo = async () => {
    if (!tenantSlug) {
      setCurrentTenantId(getTenantId());
      return;
    }
    
    try {
      const response = await fetch('https://functions.poehali.dev/2163d682-19a2-462b-b577-7f04219cc3c8');
      const data = await response.json();
      if (data.tenants) {
        const tenant = data.tenants.find((t: any) => t.slug === tenantSlug);
        if (tenant) {
          console.log(`[Index] Loaded tenant: ${tenant.name} (ID: ${tenant.id}, slug: ${tenantSlug})`);
          setCurrentTenantId(tenant.id);
        } else {
          console.warn(`[Index] Tenant not found for slug: ${tenantSlug}`);
        }
      }
    } catch (error) {
      console.error('Error loading tenant info:', error);
    }
  };

  const loadPageSettings = async () => {
    try {
      const tenantId = currentTenantId || getTenantId();
      const url = tenantId ? `${BACKEND_URLS.getPageSettings}?tenant_id=${tenantId}` : BACKEND_URLS.getPageSettings;
      const response = await fetch(url);
      const data = await response.json();
      if (data.settings) {
        setPageSettings(data.settings);
      }
      if (data.quickQuestions) {
        setQuickQuestions(data.quickQuestions);
      }
    } catch (error) {
      console.error('Error loading page settings:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const tenantId = currentTenantId || getTenantId();
      const url = tenantId ? `${BACKEND_URLS.getDocuments}?tenant_id=${tenantId}` : BACKEND_URLS.getDocuments;
      const response = await authenticatedFetch(url);
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(BACKEND_URLS.chat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: inputMessage,
          sessionId 
        })
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось получить ответ',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка сети',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Выберите PDF файлы',
        variant: 'destructive'
      });
      return;
    }

    const pdfFiles = Array.from(files).filter(f => f.name.endsWith('.pdf'));
    if (pdfFiles.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Выберите PDF файлы',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    toast({ title: 'Загрузка...', description: `Загружаем ${pdfFiles.length} файл(ов)` });

    let successCount = 0;
    let errorCount = 0;

    for (const file of pdfFiles) {
      try {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64 = e.target?.result as string;
            resolve(base64.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const uploadResponse = await fetch(BACKEND_URLS.uploadPdf, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileData: base64Data,
            category: 'Общая'
          })
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error);
        }

        const processResponse = await fetch(BACKEND_URLS.processPdf, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: uploadData.documentId })
        });

        const processData = await processResponse.json();

        if (processResponse.ok) {
          successCount++;
        } else {
          throw new Error(processData.error);
        }
      } catch (error: any) {
        console.error(`Error uploading ${file.name}:`, error);
        errorCount++;
      }
    }

    setIsLoading(false);
    loadDocuments();

    if (successCount > 0 && errorCount === 0) {
      toast({
        title: 'Успешно!',
        description: `Загружено ${successCount} файл(ов)`
      });
    } else if (successCount > 0 && errorCount > 0) {
      toast({
        title: 'Частично загружено',
        description: `Успешно: ${successCount}, ошибки: ${errorCount}`,
        variant: 'default'
      });
    } else {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить файлы',
        variant: 'destructive'
      });
    }

    event.target.value = '';
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleDeleteDocument = async (documentId: number) => {
    if (!confirm('Удалить этот документ? Все данные будут удалены из базы знаний.')) {
      return;
    }

    setIsLoading(true);
    toast({ title: 'Удаление...', description: 'Удаляем документ' });

    try {
      const response = await fetch(BACKEND_URLS.deletePdf, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Удалено!',
          description: 'Документ удалён из базы'
        });
        loadDocuments();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось удалить документ',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setView('admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdminAuthenticated(false);
    setView('guest');
    toast({
      title: 'Выход выполнен',
      description: 'Вы вышли из админки'
    });
  };

  if (view === 'admin' && !isAdminAuthenticated) {
    return <AdminLoginForm onLoginSuccess={handleAdminLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-4 lg:p-8 max-w-6xl">
        <header className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Icon name={pageSettings?.header_icon || 'Hotel'} size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{pageSettings?.header_title || 'Hotel Concierge'}</h1>
                <p className="text-slate-600 text-sm">{pageSettings?.header_subtitle || 'Виртуальный помощник гостей'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {isSuperAdmin() && (
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/super-admin'}
                  className="gap-2"
                >
                  <Icon name="Shield" size={18} />
                  Суперадмин
                </Button>
              )}
              <Button 
                variant={view === 'admin' ? 'default' : 'outline'}
                onClick={() => setView(view === 'guest' ? 'admin' : 'guest')}
                className="gap-2"
              >
                <Icon name={view === 'admin' ? 'Users' : 'Settings'} size={18} />
                {view === 'admin' ? 'Для гостей' : 'Админ-панель'}
              </Button>
              {view === 'admin' && isAdminAuthenticated && (
                <Button 
                  variant="ghost"
                  onClick={handleLogout}
                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Icon name="LogOut" size={18} />
                  Выйти
                </Button>
              )}
            </div>
          </div>
        </header>

        {view === 'guest' ? (
          <GuestView
            messages={messages}
            inputMessage={inputMessage}
            isLoading={isLoading}
            onInputChange={setInputMessage}
            onSendMessage={handleSendMessage}
            onQuickQuestion={handleQuickQuestion}
            pageSettings={pageSettings}
            quickQuestions={quickQuestions}
          />
        ) : (
          <AdminView
            documents={documents}
            isLoading={isLoading}
            onFileUpload={handleFileUpload}
            onDeleteDocument={handleDeleteDocument}
          />
        )}

        <footer className="mt-8 text-center text-sm text-slate-600 animate-fade-in">
          {view === 'admin' ? (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
                <div>
                  <p className="font-medium text-slate-700">Контакты</p>
                  <a href="mailto:info@298100.ru" className="hover:text-primary transition-colors">info@298100.ru</a>
                  <br />
                  <a href="tel:+79787236035" className="hover:text-primary transition-colors">+7 (978) 723-60-35</a>
                  <br />
                  <span className="text-xs">Республика Крым, г. Феодосия</span>
                </div>
                <div className="border-l border-slate-300 h-16 hidden sm:block"></div>
                <div>
                  <p className="font-medium text-slate-700">Реквизиты</p>
                  <p className="text-xs">Плательщик НПД</p>
                  <p className="text-xs">Прохоров С. В.</p>
                  <p className="text-xs">ИНН: 910800040469</p>
                </div>
              </div>
            </div>
          ) : (
            <a 
              href="https://max.ru/u/f9LHodD0cOIrknUlAYx1LxuVyfuHRhIq-OHhkpPMbwJ_WcjW4dhTFpEEez0"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors underline"
            >
              Хочу такого бота!
            </a>
          )}
        </footer>
      </div>
    </div>
  );
};

export default Index;