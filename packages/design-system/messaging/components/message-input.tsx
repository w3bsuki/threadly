'use client';

import { Button, Textarea } from '@repo/ui/components';
import { cn } from '@repo/ui/lib/utils';
import { Image, Paperclip, Send, Smile } from 'lucide-react';
import { type KeyboardEvent, useCallback, useRef, useState } from 'react';
import type { MessageInputProps } from '../types';

export function MessageInput({
  conversationId,
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValid = content.trim().length > 0;
  const isSending = disabled || isUploading;

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max 120px
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  // Handle content change
  const handleContentChange = (value: string) => {
    setContent(value);
    setTimeout(adjustTextareaHeight, 0);
  };

  // Handle send message
  const handleSend = useCallback(() => {
    if (!isValid || isSending) return;

    const messageContent = content.trim();
    setContent('');
    onSend(messageContent);

    // Reset textarea height
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
      }
    }, 0);
  }, [content, isValid, isSending, onSend]);

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow new line with Shift+Enter
        return;
      }
      // Send message with Enter
      e.preventDefault();
      handleSend();
    }
  };

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file) return;

      // Validate file type and size
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        return;
      }

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('conversationId', conversationId);

        const response = await fetch('/api/messages/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          onSend('', data.data.imageUrl);
        } else {
          throw new Error(data.error || 'Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
    [conversationId, onSend]
  );

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="border-t bg-background p-4">
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <div className="flex flex-col gap-1">
          <Button
            className="h-8 w-8 p-0"
            disabled={isSending}
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            variant="ghost"
          >
            <Image className="h-4 w-4" />
          </Button>
          <input
            accept="image/*"
            className="hidden"
            onChange={handleFileInputChange}
            ref={fileInputRef}
            type="file"
          />
        </div>

        {/* Message input */}
        <div className="relative flex-1">
          <Textarea
            className={cn(
              'max-h-[120px] min-h-[40px] resize-none border-border focus:border-blue-500 focus:ring-blue-500',
              'py-2 pr-12'
            )}
            disabled={isSending}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleContentChange(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            ref={textareaRef}
            rows={1}
            value={content}
          />

          {/* Character count */}
          {content.length > 0 && (
            <span
              className={cn(
                'absolute right-2 bottom-2 text-xs',
                content.length > 1000 ? 'text-red-500' : 'text-muted-foreground'
              )}
            >
              {content.length}/1000
            </span>
          )}
        </div>

        {/* Send button */}
        <Button
          className="h-8 w-8 p-0"
          disabled={!isValid || isSending}
          onClick={handleSend}
          size="sm"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Upload progress */}
      {isUploading && (
        <div className="mt-2 flex items-center gap-2 text-muted-foreground text-sm">
          <div className="h-4 w-4 animate-spin rounded-[var(--radius-full)] border-2 border-blue-600 border-t-transparent" />
          Uploading image...
        </div>
      )}

      {/* Tips */}
      <div className="mt-2 text-muted-foreground text-xs">
        Press Enter to send • Shift+Enter for new line
      </div>
    </div>
  );
}
