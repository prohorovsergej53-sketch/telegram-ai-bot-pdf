import Icon from '@/components/ui/icon';
import { Message } from './types';

interface ChatMessageProps {
  message: Message;
}

const cleanMessageContent = (content: string): string => {
  return content
    .replace(/<a\s+href="tel:[^"]*">([^<]+)<\/a>/gi, '$1')
    .replace(/<a\s+href="mailto:[^"]*">([^<]+)<\/a>/gi, '$1')
    .replace(/<a\s+[^>]*>([^<]+)<\/a>/gi, '$1')
    .replace(/<[^>]+>/g, '');
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  const cleanContent = cleanMessageContent(message.content);
  
  return (
    <div
      className={`flex gap-3 animate-fade-in ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        message.role === 'assistant' ? 'bg-primary' : 'bg-slate-300'
      }`}>
        {message.role === 'assistant' ? (
          <Icon name="ConciergeBell" size={16} className="text-white" />
        ) : (
          <Icon name="User" size={16} className="text-slate-700" />
        )}
      </div>
      <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
        <div className={`inline-block px-4 py-3 rounded-2xl max-w-[85%] ${
          message.role === 'assistant'
            ? 'bg-slate-100 text-slate-900'
            : 'bg-primary text-white'
        }`}>
          <p className="text-sm leading-relaxed">{cleanContent}</p>
        </div>
        <p className="text-xs text-slate-500 mt-1 px-1">{message.timestamp}</p>
      </div>
    </div>
  );
};

export default ChatMessage;