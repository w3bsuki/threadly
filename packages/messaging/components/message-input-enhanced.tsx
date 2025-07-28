'use client';

import { Button, Input } from '@repo/design-system/components';
import { Send } from 'lucide-react';
import { useRef, useState } from 'react';

interface MessageInputEnhancedProps {
  onSend: (message: string) => void;
  onTyping: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInputEnhanced({
  onSend,
  onTyping,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageInputEnhancedProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    onSend(message.trim());
    setMessage('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    onTyping(value);
  };

  return (
    <div className="safe-area-pb border-t p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <Input
          className="flex-1"
          disabled={disabled}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          ref={inputRef}
          value={message}
        />
        <Button
          className="touch-target"
          disabled={!message.trim() || disabled}
          onClick={handleSend}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
