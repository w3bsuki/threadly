'use client';

import { memo, useState } from 'react';
import { Card, CardContent, CardHeader } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components';
import Image from 'next/image';

interface NewConversationCardProps {
  targetUser: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  targetProduct: {
    id: string;
    title: string;
    price: number;
    images: { imageUrl: string }[];
  };
  onCreateConversation: (message: string) => Promise<void>;
  isCreating: boolean;
  onCancel: () => void;
}

export const NewConversationCard = memo(({ 
  targetUser, 
  targetProduct, 
  onCreateConversation, 
  isCreating,
  onCancel 
}: NewConversationCardProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      await onCreateConversation(message);
      setMessage('');
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={targetUser.imageUrl || undefined} />
              <AvatarFallback>
                {targetUser.firstName?.[0]}
                {targetUser.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">
                {targetUser.firstName} {targetUser.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">Start a new conversation</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="mb-4 p-3 bg-muted rounded-[var(--radius-lg)]">
          <div className="flex gap-3">
            {targetProduct.images[0] && (
              <div className="relative w-16 h-16 rounded-[var(--radius-md)] overflow-hidden">
                <Image
                  src={targetProduct.images[0].imageUrl}
                  alt={targetProduct.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-medium line-clamp-1">{targetProduct.title}</h4>
              <p className="text-lg font-bold">${targetProduct.price.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="flex-1 mb-4">
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Your message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'm interested in your item..."
              className="w-full h-32 p-3 border rounded-[var(--radius-md)] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCreating}
              required
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating || !message.trim()}
              className="flex-1"
            >
              {isCreating ? 'Starting conversation...' : 'Send Message'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});

NewConversationCard.displayName = 'NewConversationCard';