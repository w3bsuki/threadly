'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardHeader,
} from '@repo/ui/components';
import Image from 'next/image';
import { memo, useState } from 'react';

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

export const NewConversationCard = memo(
  ({
    targetUser,
    targetProduct,
    onCreateConversation,
    isCreating,
    onCancel,
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
      <Card className="flex h-full flex-col">
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
                <p className="text-muted-foreground text-sm">
                  Start a new conversation
                </p>
              </div>
            </div>
            <Button onClick={onCancel} size="sm" variant="ghost">
              Cancel
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col">
          <div className="mb-4 rounded-[var(--radius-lg)] bg-muted p-3">
            <div className="flex gap-3">
              {targetProduct.images[0] && (
                <div className="relative h-16 w-16 overflow-hidden rounded-[var(--radius-md)]">
                  <Image
                    alt={targetProduct.title}
                    className="object-cover"
                    fill
                    src={targetProduct.images[0].imageUrl}
                  />
                </div>
              )}
              <div className="flex-1">
                <h4 className="line-clamp-1 font-medium">
                  {targetProduct.title}
                </h4>
                <p className="font-bold text-lg">
                  ${targetProduct.price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <form className="flex flex-1 flex-col" onSubmit={handleSubmit}>
            <div className="mb-4 flex-1">
              <label
                className="mb-2 block font-medium text-sm"
                htmlFor="message"
              >
                Your message
              </label>
              <textarea
                className="h-32 w-full resize-none rounded-[var(--radius-md)] border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCreating}
                id="message"
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi! I'm interested in your item..."
                required
                value={message}
              />
            </div>

            <div className="flex gap-2">
              <Button
                disabled={isCreating}
                onClick={onCancel}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={isCreating || !message.trim()}
                type="submit"
              >
                {isCreating ? 'Starting conversation...' : 'Send Message'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }
);

NewConversationCard.displayName = 'NewConversationCard';
