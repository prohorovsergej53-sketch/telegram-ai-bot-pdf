import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import GuestView from '@/components/hotel/GuestView';
import AdminView from '@/components/hotel/AdminView';
import { Message, Document, BACKEND_URLS } from '@/components/hotel/types';

const Index = () => {
  const [view, setView] = useState<'guest' | 'admin'>('guest');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: 'Здравствуйте! Я виртуальный консьерж отеля. Чем могу помочь?', 
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const { toast } = useToast();

  useEffect(() => {
    if (view === 'admin') {
      loadDocuments();
    }
  }, [view]);

  const loadDocuments = async () => {
    try {
      const response = await fetch(BACKEND_URLS.getDocuments);
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
    const file = event.target.files?.[0];
    if (!file || !file.name.endsWith('.pdf')) {
      toast({
        title: 'Ошибка',
        description: 'Выберите PDF файл',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    toast({ title: 'Загрузка...', description: 'Отправляем файл' });

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1];

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

        toast({ title: 'Обработка...', description: 'Извлекаем текст из PDF' });

        const processResponse = await fetch(BACKEND_URLS.processPdf, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: uploadData.documentId })
        });

        const processData = await processResponse.json();

        if (processResponse.ok) {
          toast({
            title: 'Успешно!',
            description: `Загружено ${processData.pages} страниц`
          });
          loadDocuments();
        } else {
          throw new Error(processData.error);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось загрузить файл',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-4 lg:p-8 max-w-6xl">
        <header className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Icon name="Hotel" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Hotel Concierge</h1>
                <p className="text-slate-600 text-sm">Виртуальный помощник гостей</p>
              </div>
            </div>
            <Button 
              variant={view === 'admin' ? 'default' : 'outline'}
              onClick={() => setView(view === 'guest' ? 'admin' : 'guest')}
              className="gap-2"
            >
              <Icon name={view === 'admin' ? 'Users' : 'Settings'} size={18} />
              {view === 'admin' ? 'Для гостей' : 'Админ-панель'}
            </Button>
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
          />
        ) : (
          <AdminView
            documents={documents}
            isLoading={isLoading}
            onFileUpload={handleFileUpload}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
