import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Document {
  id: number;
  name: string;
  size: string;
  pages: number;
  category: string;
  status: string;
  uploadedAt: string;
}

const BACKEND_URLS = {
  chat: 'https://functions.poehali.dev/7b58f4fb-5db0-4f85-bb3b-55bafa4cbf73',
  uploadPdf: 'https://functions.poehali.dev/1ecfd90c-5cef-40a0-af5b-3ba36d6c50c9',
  processPdf: 'https://functions.poehali.dev/44b9c312-5377-4fa7-8b4c-522f4bbbf201',
  getDocuments: 'https://functions.poehali.dev/7588840b-ea6f-4e3e-9f16-ae0ace5a59c6'
};

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

  const quickQuestions = [
    { icon: 'Bed', text: 'Типы номеров', question: 'Какие типы номеров доступны?' },
    { icon: 'UtensilsCrossed', text: 'Завтрак', question: 'Во сколько завтрак?' },
    { icon: 'Wifi', text: 'Wi-Fi', question: 'Как подключиться к Wi-Fi?' },
    { icon: 'Dumbbell', text: 'Фитнес', question: 'Есть ли тренажерный зал?' },
    { icon: 'Car', text: 'Парковка', question: 'Где находится парковка?' },
    { icon: 'Sparkles', text: 'SPA', question: 'Расскажите про SPA-центр' },
  ];

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="shadow-xl animate-scale-in h-[calc(100vh-200px)]">
                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="MessageCircle" size={20} />
                    Чат с консьержем
                  </CardTitle>
                  <CardDescription>Спросите о номерах, услугах и инфраструктуре</CardDescription>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[calc(100%-100px)]">
                  <ScrollArea className="flex-1 p-6">
                    <div className="space-y-4">
                      {messages.map((msg, idx) => (
                        <div
                          key={msg.id}
                          className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.role === 'assistant' ? 'bg-primary' : 'bg-slate-300'
                          }`}>
                            {msg.role === 'assistant' ? (
                              <Icon name="ConciergeBell" size={16} className="text-white" />
                            ) : (
                              <Icon name="User" size={16} className="text-slate-700" />
                            )}
                          </div>
                          <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                            <div className={`inline-block px-4 py-3 rounded-2xl max-w-[85%] ${
                              msg.role === 'assistant'
                                ? 'bg-slate-100 text-slate-900'
                                : 'bg-primary text-white'
                            }`}>
                              <p className="text-sm leading-relaxed">{msg.content}</p>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 px-1">{msg.timestamp}</p>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <Icon name="Loader2" size={16} className="text-white animate-spin" />
                          </div>
                          <div className="bg-slate-100 px-4 py-3 rounded-2xl">
                            <p className="text-sm text-slate-600">Думаю...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t bg-slate-50/50">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Задайте вопрос..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                        disabled={isLoading}
                        className="flex-1 bg-white"
                      />
                      <Button onClick={handleSendMessage} size="icon" disabled={isLoading}>
                        <Icon name="Send" size={18} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="shadow-xl animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon name="Lightbulb" size={18} />
                    Быстрые вопросы
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {quickQuestions.map((q, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="h-auto py-3 px-3 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-primary transition-all"
                        onClick={() => {
                          setInputMessage(q.question);
                          setTimeout(() => handleSendMessage(), 100);
                        }}
                        disabled={isLoading}
                      >
                        <Icon name={q.icon as any} size={20} className="text-primary" />
                        <span className="text-xs font-medium text-center">{q.text}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon name="Info" size={18} />
                    Контакты
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon name="Phone" size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Ресепшн</p>
                      <p className="text-slate-600">+7 (495) 123-45-67</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Icon name="Mail" size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Email</p>
                      <p className="text-slate-600">info@hotel.ru</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Icon name="MapPin" size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Адрес</p>
                      <p className="text-slate-600">Москва, ул. Примерная, 1</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon name="FileText" size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{documents.length}</p>
                      <p className="text-xs text-slate-600">Документов</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Icon name="BookOpen" size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {documents.reduce((sum, doc) => sum + (doc.pages || 0), 0)}
                      </p>
                      <p className="text-xs text-slate-600">Страниц</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Icon name="CheckCircle" size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {documents.filter(d => d.status === 'ready').length}
                      </p>
                      <p className="text-xs text-slate-600">Готовы</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Icon name="Loader2" size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {documents.filter(d => d.status === 'processing').length}
                      </p>
                      <p className="text-xs text-slate-600">Обработка</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-xl">
                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Upload" size={20} />
                    Загрузка документов
                  </CardTitle>
                  <CardDescription>Добавьте PDF с информацией об отеле</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-primary hover:bg-blue-50/50 transition-all group">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Icon name={isLoading ? 'Loader2' : 'Upload'} size={24} className={`text-primary ${isLoading ? 'animate-spin' : ''}`} />
                      </div>
                      <p className="font-medium text-slate-900 mb-1">
                        {isLoading ? 'Загрузка...' : 'Выберите PDF файл'}
                      </p>
                      <p className="text-sm text-slate-600">или перетащите сюда</p>
                    </div>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-xl">
                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Library" size={20} />
                    База знаний
                  </CardTitle>
                  <CardDescription>{documents.length} документов</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[320px]">
                    {documents.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">
                        <Icon name="FileText" size={48} className="mx-auto mb-3 opacity-30" />
                        <p>Документы ещё не загружены</p>
                      </div>
                    ) : (
                      <div className="p-4 space-y-2">
                        {documents.map((doc, idx) => (
                          <div
                            key={doc.id}
                            className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                doc.status === 'ready' ? 'bg-blue-100' : 'bg-orange-100'
                              }`}>
                                <Icon name={doc.status === 'ready' ? 'FileText' : 'Loader2'} 
                                  size={18} 
                                  className={`${doc.status === 'ready' ? 'text-primary' : 'text-orange-600 animate-spin'}`} 
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-slate-900 truncate">{doc.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-700">{doc.category}</span>
                                  {doc.pages > 0 && <span className="text-xs text-slate-600">{doc.pages} стр.</span>}
                                  <span className="text-xs text-slate-600">{doc.size}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
