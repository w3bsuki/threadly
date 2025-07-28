'use client';

import { Button, Card, CardContent } from '@repo/design-system/components';
import { MessageCircle, Star, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductSeller } from '../../types';

interface SellerInfoCardProps {
  seller: ProductSeller;
  productId: string;
}

export function SellerInfoCard({ seller, productId }: SellerInfoCardProps) {
  const memberSince = new Date(seller.joinedAt).getFullYear();

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {seller.imageUrl ? (
            <Image
              alt={`${seller.firstName} ${seller.lastName}` || 'Seller'}
              className="rounded-[var(--radius-full)]"
              height={48}
              src={seller.imageUrl}
              width={48}
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)] bg-accent">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <Link className="hover:underline" href={`/seller/${seller.id}`}>
              <h3 className="truncate font-semibold text-foreground text-sm">
                {seller.firstName && seller.lastName
                  ? `${seller.firstName} ${seller.lastName}`
                  : 'Anonymous Seller'}
              </h3>
            </Link>
            <div className="flex items-center gap-3 text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>4.8</span>
              </div>
              <span>•</span>
              <span>{seller._count.listings} sold</span>
              <span>•</span>
              <span className="hidden sm:inline">
                Member since {memberSince}
              </span>
              <span className="sm:hidden">{memberSince}</span>
            </div>
          </div>
          <Link href={`/messages?sellerId=${seller.id}&productId=${productId}`}>
            <Button className="text-xs" size="sm" variant="outline">
              <MessageCircle className="mr-1 h-3 w-3" />
              Message
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
