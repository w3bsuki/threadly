'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Skeleton } from '@repo/design-system/components';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Recommendation {
  productId: string;
  score: number;
  reason: string;
}

interface ProductRecommendationsProps {
  type?: 'PERSONALIZED' | 'TRENDING' | 'NEW_FOR_YOU';
  title?: string;
  productId?: string;
}

export function ProductRecommendations({ 
  type = 'PERSONALIZED',
  title = 'Recommended for You',
  productId
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchRecommendations();
  }, [type, productId]);

  const fetchRecommendations = async () => {
    try {
      const params = new URLSearchParams({
        type,
        limit: '10',
        ...(productId && { productId }),
      });

      const response = await fetch(`/api/recommendations?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + 4 >= recommendations.length ? 0 : prev + 4
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev - 4 < 0 ? Math.max(0, recommendations.length - 4) : prev - 4
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square rounded-[var(--radius-lg)]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  const visibleRecommendations = recommendations.slice(currentIndex, currentIndex + 4);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={nextSlide}
              disabled={currentIndex + 4 >= recommendations.length}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {visibleRecommendations.map((rec) => (
            <Link
              key={rec.productId}
              href={`/products/${rec.productId}`}
              className="group"
            >
              <div className="space-y-2">
                <div className="aspect-square bg-muted rounded-[var(--radius-lg)] overflow-hidden">
                  {/* Product image would go here */}
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Package className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <p className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
                    Product #{rec.productId.slice(-6)}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {rec.reason}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Missing import
import { Package } from 'lucide-react';