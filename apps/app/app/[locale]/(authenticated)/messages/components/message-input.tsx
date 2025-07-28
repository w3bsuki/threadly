'use client';

import { Button, Input } from '@repo/design-system/components';
import { Send } from 'lucide-react';
import { memo } from 'react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
}

export const MessageInput = memo(
  ({ value, onChange, onSend, isSending }: MessageInputProps) => {
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    };

    return (
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            disabled={isSending}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            value={value}
          />
          <Button
            disabled={!value.trim() || isSending}
            onClick={onSend}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
);

MessageInput.displayName = 'MessageInput';
