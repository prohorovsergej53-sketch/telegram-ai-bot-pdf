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
    .replace(/<b>(.*?)<\/b>/gi, '<strong>$1</strong>')
    .replace(/<[^>]+>/g, '');
};

const formatMessageContent = (content: string): JSX.Element[] => {
  const cleanedContent = cleanMessageContent(content);
  const parts: JSX.Element[] = [];
  
  const phoneRegex = /(\+7\s?\(?\d{3}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}|\+7\d{10}|8\s?\(?\d{3}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2})/g;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  let lastIndex = 0;
  const matches: Array<{index: number; length: number; type: 'phone' | 'url'; value: string}> = [];
  
  let match;
  while ((match = phoneRegex.exec(cleanedContent)) !== null) {
    matches.push({index: match.index, length: match[0].length, type: 'phone', value: match[0]});
  }
  while ((match = urlRegex.exec(cleanedContent)) !== null) {
    matches.push({index: match.index, length: match[0].length, type: 'url', value: match[0]});
  }
  
  matches.sort((a, b) => a.index - b.index);
  
  matches.forEach((m, idx) => {
    if (m.index > lastIndex) {
      parts.push(<span key={`text-${idx}`}>{cleanedContent.slice(lastIndex, m.index)}</span>);
    }
    
    if (m.type === 'phone') {
      const cleanPhone = m.value.replace(/\D/g, '');
      parts.push(
        <a
          key={`phone-${idx}`}
          href={`tel:+${cleanPhone}`}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {m.value}
        </a>
      );
    } else if (m.type === 'url') {
      parts.push(
        <a
          key={`url-${idx}`}
          href={m.value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {m.value}
        </a>
      );
    }
    
    lastIndex = m.index + m.length;
  });
  
  if (lastIndex < cleanedContent.length) {
    parts.push(<span key="text-last">{cleanedContent.slice(lastIndex)}</span>);
  }
  
  return parts.length > 0 ? parts : [<span key="default">{cleanedContent}</span>];
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  const formattedContent = formatMessageContent(message.content);
  
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
          <p className="text-sm leading-relaxed whitespace-pre-line">{formattedContent}</p>
        </div>
        <p className="text-xs text-slate-500 mt-1 px-1">{message.timestamp}</p>
      </div>
    </div>
  );
};

export default ChatMessage;