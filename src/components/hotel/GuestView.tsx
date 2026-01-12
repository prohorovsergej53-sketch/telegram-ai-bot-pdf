import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import ChatMessage from './ChatMessage';
import { Message, quickQuestions } from './types';

interface GuestViewProps {
  messages: Message[];
  inputMessage: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onQuickQuestion: (question: string) => void;
}

const GuestView = ({
  messages,
  inputMessage,
  isLoading,
  onInputChange,
  onSendMessage,
  onQuickQuestion
}: GuestViewProps) => {
  return (
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
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
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
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && onSendMessage()}
                  disabled={isLoading}
                  className="flex-1 bg-white"
                />
                <Button onClick={onSendMessage} size="icon" disabled={isLoading}>
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
                  onClick={() => onQuickQuestion(q.question)}
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
  );
};

export default GuestView;
