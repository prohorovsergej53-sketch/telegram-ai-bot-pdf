import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PageSettings {
  header_title?: string;
  header_subtitle?: string;
  input_placeholder?: string;
  consent_enabled?: boolean;
  consent_text?: string;
  page_title?: string;
}

interface QuickQuestion {
  text: string;
  question: string;
  icon: string;
}

const CHAT_API = 'https://functions.poehali.dev/7b58f4fb-5db0-4f85-bb3b-55bafa4cbf73';
const SETTINGS_API = 'https://functions.poehali.dev/0534411b-d900-45d2-9082-a9485b33cf20';

const ChatWidget = () => {
  const { tenantSlug } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageSettings, setPageSettings] = useState<PageSettings | null>(null);
  const [quickQuestions, setQuickQuestions] = useState<QuickQuestion[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [consentGiven, setConsentGiven] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Загружаем настройки страницы
        let welcomeMessage = 'Здравствуйте! Я AI-консультант. Чем могу помочь?';
        
        if (tenantSlug) {
          const response = await fetch(`${SETTINGS_API}?slug=${tenantSlug}`);
          if (response.ok) {
            const data = await response.json();
            setPageSettings(data.settings || data);
            setQuickQuestions(data.quickQuestions || []);
            
            // Используем page_title как приветствие, если оно есть
            if (data.settings?.page_title) {
              welcomeMessage = data.settings.page_title;
            }
          }
        }

        // Добавляем приветственное сообщение
        setMessages([{
          id: '1',
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date()
        }]);
      } catch (error) {
        console.error('Ошибка инициализации:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    initialize();
  }, [tenantSlug]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !tenantSlug) return;

    // Проверка согласия
    const hasUserMessages = messages.some(msg => msg.role === 'user');
    if (pageSettings?.consent_enabled && !hasUserMessages && !consentGiven) {
      alert('Пожалуйста, дайте согласие на обработку персональных данных');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          tenantSlug: tenantSlug,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || data.response || 'Извините, не удалось получить ответ.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Произошла ошибка. Попробуйте позже.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon name="Bot" className="w-12 h-12 text-blue-600 animate-pulse" />
          <span className="text-blue-600 font-medium">Загрузка...</span>
        </div>
      </div>
    );
  }

  const hasUserMessages = messages.some(msg => msg.role === 'user');
  const showConsent = pageSettings?.consent_enabled && !hasUserMessages && !consentGiven;

  return (
    <div className="h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl h-[90vh] flex flex-col shadow-2xl">
        <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <Icon name="Bot" className="w-8 h-8" />
            <CardTitle className="text-2xl">
              {pageSettings?.header_title || 'AI Консультант'}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6">
            {quickQuestions.length > 0 && messages.length === 1 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputMessage(q.question);
                      setTimeout(() => sendMessage(), 100);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-full text-sm text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-sm"
                  >
                    <Icon name={q.icon} size={16} />
                    {q.text}
                  </button>
                ))}
              </div>
            )}
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div 
                      className="whitespace-pre-wrap break-words"
                      dangerouslySetInnerHTML={{
                        __html: msg.content
                          .replace(/<b>(.*?)<\/b>/gi, '<strong>$1</strong>')
                          .replace(/\n/g, '<br />')
                          .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline;">$1</a>')
                      }}
                    />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                    <span className="text-gray-600">печатает</span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-4 bg-white">
            {showConsent && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="consent" className="text-sm text-gray-700 cursor-pointer">
                  {pageSettings?.consent_text || 'Я согласен на обработку персональных данных'}
                </label>
              </div>
            )}

            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={pageSettings?.input_placeholder || 'Напишите ваш вопрос...'}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatWidget;