import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface Document {
  id: string;
  name: string;
  size: string;
  pages: number;
  uploadedAt: string;
  status: 'processing' | 'ready';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const Index = () => {
  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', name: 'Руководство пользователя.pdf', size: '2.4 MB', pages: 45, uploadedAt: '2026-01-10', status: 'ready' },
    { id: '2', name: 'Техническая документация.pdf', size: '5.1 MB', pages: 120, uploadedAt: '2026-01-09', status: 'ready' },
    { id: '3', name: 'API справочник.pdf', size: '1.8 MB', pages: 32, uploadedAt: '2026-01-08', status: 'ready' },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Привет! Я готов помочь с вашими документами. Задайте вопрос или загрузите новый PDF.', timestamp: '10:23' }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');

    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Отличный вопрос! Анализирую документы...',
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, response]);
    }, 800);
  };

  const stats = {
    totalDocs: documents.length,
    totalPages: documents.reduce((sum, doc) => sum + doc.pages, 0),
    queries: 127,
    avgResponseTime: '1.2s'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-4 lg:p-8">
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Icon name="FileText" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">PDF AI Bot</h1>
              <p className="text-slate-600 text-sm">Умный помощник для работы с документами</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon name="FileText" size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats.totalDocs}</p>
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
                      <p className="text-2xl font-bold text-slate-900">{stats.totalPages}</p>
                      <p className="text-xs text-slate-600">Страниц</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Icon name="MessageSquare" size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats.queries}</p>
                      <p className="text-xs text-slate-600">Запросов</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Icon name="Zap" size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats.avgResponseTime}</p>
                      <p className="text-xs text-slate-600">Ответ</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-xl animate-scale-in">
              <CardHeader className="border-b bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="MessageCircle" size={20} />
                      Чат с документами
                    </CardTitle>
                    <CardDescription>Задайте вопрос по вашим PDF</CardDescription>
                  </div>
                  {selectedDoc && (
                    <Badge variant="secondary" className="gap-1">
                      <Icon name="FileText" size={12} />
                      {documents.find(d => d.id === selectedDoc)?.name}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-6">
                  <div className="space-y-4">
                    {messages.map((msg, idx) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.role === 'assistant' ? 'bg-primary' : 'bg-slate-300'
                        }`}>
                          {msg.role === 'assistant' ? (
                            <Icon name="Bot" size={16} className="text-white" />
                          ) : (
                            <Icon name="User" size={16} className="text-slate-700" />
                          )}
                        </div>
                        <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                          <div className={`inline-block px-4 py-3 rounded-2xl max-w-[80%] ${
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
                  </div>
                </ScrollArea>
                <div className="p-4 border-t bg-slate-50/50">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Введите вопрос..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-white"
                    />
                    <Button onClick={handleSendMessage} size="icon" className="flex-shrink-0">
                      <Icon name="Send" size={18} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-xl animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Upload" size={20} />
                  Загрузка документов
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-primary hover:bg-blue-50/50 transition-all cursor-pointer group">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon name="Upload" size={24} className="text-primary" />
                  </div>
                  <p className="font-medium text-slate-900 mb-1">Выберите PDF файл</p>
                  <p className="text-sm text-slate-600">или перетащите сюда</p>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Icon name="Cloud" size={18} className="mr-2" />
                  Подключить облако
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-xl animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Library" size={20} />
                  Библиотека
                </CardTitle>
                <CardDescription>Ваши документы</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <div className="p-4 space-y-2">
                    {documents.map((doc, idx) => (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md animate-fade-in ${
                          selectedDoc === doc.id ? 'border-primary bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            selectedDoc === doc.id ? 'bg-primary' : 'bg-slate-100'
                          }`}>
                            <Icon name="FileText" size={18} className={selectedDoc === doc.id ? 'text-white' : 'text-slate-600'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-900 truncate">{doc.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-600">{doc.pages} стр.</span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-slate-600">{doc.size}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={doc.status === 'ready' ? 'default' : 'secondary'} className="text-xs">
                                {doc.status === 'ready' ? 'Готов' : 'Обработка'}
                              </Badge>
                              <span className="text-xs text-slate-500">{doc.uploadedAt}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
