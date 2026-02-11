import React from 'react';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: React.ReactNode;
  className?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ role, content, className }) => {
  const isAssistant = role === 'assistant';

  return (
    <div className={cn(
      "flex w-full gap-3 mb-6",
      isAssistant ? "justify-start" : "justify-end",
      className
    )}>
      {isAssistant && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center flex-shrink-0 border border-blue-100 shadow-sm">
          <Bot className="w-6 h-6 text-blue-600" />
        </div>
      )}

      <div className={cn(
        "max-w-[85%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm transition-all",
        isAssistant 
          ? "bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-gray-100" 
          : "bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-tr-none shadow-orange-100"
      )}>
        {content}
      </div>

      {!isAssistant && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center flex-shrink-0 border border-amber-100 shadow-sm">
          <User className="w-6 h-6 text-amber-600" />
        </div>
      )}
    </div>
  );
};
