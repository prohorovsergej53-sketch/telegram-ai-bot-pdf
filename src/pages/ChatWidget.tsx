import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChatArea from '@/components/hotel/ChatArea';
import { Message, PageSettings, BACKEND_URLS } from '@/components/hotel/types';

const ChatWidget = () => {
  const { tenantSlug } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageSettings, setPageSettings] = useState<PageSettings | null>(null);

  useEffect(() => {
    loadPageSettings();
    addWelcomeMessage();
  }, [tenantSlug]);

  const loadPageSettings = async () => {
    if (!tenantSlug) return;
    
    try {
      const response = await fetch(`${BACKEND_URLS.getPageSettings}?slug=${tenantSlug}`);
      if (response.ok) {
        const data = await response.json();
        setPageSettings(data);
      }
    } catch (error) {
      console.error('Error loading page settings:', error);
    }
  };

  const addWelcomeMessage = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Здравствуйте! Я AI-консультант. Чем могу помочь?',
      timestamp: new Date()
    }]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !tenantSlug) return;

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
      const response = await fetch(BACKEND_URLS.chat, {
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
      console.error('Error sending message:', error);
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

  return (
    <div className="h-screen w-full bg-white p-0 m-0" style={{ overflow: 'hidden' }}>
      <ChatArea
        messages={messages}
        inputMessage={inputMessage}
        isLoading={isLoading}
        onInputChange={setInputMessage}
        onSendMessage={sendMessage}
        pageSettings={pageSettings || undefined}
        consentEnabled={pageSettings?.consent_enabled}
        consentText={pageSettings?.consent_text}
        isWidget={true}
      />
    </div>
  );
};

export default ChatWidget;