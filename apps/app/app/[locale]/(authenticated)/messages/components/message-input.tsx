'use client';

import { Button } from '@repo/design-system/components';
import { Input } from '@repo/design-system/components';
import { Send } from 'lucide-react';
import { memo } from 'react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
}

export const MessageInput = memo(({ value, onChange, onSend, isSending }: MessageInputProps) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-4 border-t">
      <div className="flex gap-2">
        <Input
          placeholder="Type your message..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isSending}
        />
        <Button 
          onClick={onSend}
          disabled={!value.trim() || isSending}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

MessageInput.displayName = 'MessageInput';