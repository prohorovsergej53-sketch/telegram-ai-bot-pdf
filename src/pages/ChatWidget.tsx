import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { Loader2, Send } from 'lucide-react';

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
}

const CHAT_API = 'https://functions.poehali.dev/7b58f4fb-5db0-4f85-bb3b-55bafa4cbf73';
const SETTINGS_API = 'https://functions.poehali.dev/0534411b-d900-45d2-9082-a9485b33cf20';

const ChatWidget = () => {
  const { tenantSlug } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageSettings, setPageSettings] = useState<PageSettings | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Загружаем настройки страницы
        if (tenantSlug) {
          const response = await fetch(`${SETTINGS_API}?slug=${tenantSlug}`);
          if (response.ok) {
            const data = await response.json();
            setPageSettings(data);
          }
        }

        // Добавляем приветственное сообщение
        setMessages([{
          id: '1',
          role: 'assistant',
          content: 'Здравствуйте! Я AI-консультант. Чем могу помочь?',
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
        content: data.response || 'Извините, не удалось получить ответ.',
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
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
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
            <div>
              <CardTitle className="text-2xl">
                {pageSettings?.header_title || 'AI Консультант'}
              </CardTitle>
              <p className="text-blue-100 text-sm">
                {pageSettings?.header_subtitle || 'Онлайн 24/7'}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6">
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
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                  </div>
                </div>
              )}
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
