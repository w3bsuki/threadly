'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@repo/design-system/components';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
  productId,
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div className="space-y-2" key={i}>
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

  const visibleRecommendations = recommendations.slice(
    currentIndex,
    currentIndex + 4
  );

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
              className="h-8 w-8"
              disabled={currentIndex === 0}
              onClick={prevSlide}
              size="icon"
              variant="ghost"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              className="h-8 w-8"
              disabled={currentIndex + 4 >= recommendations.length}
              onClick={nextSlide}
              size="icon"
              variant="ghost"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {visibleRecommendations.map((rec) => (
            <Link
              className="group"
              href={`/products/${rec.productId}`}
              key={rec.productId}
            >
              <div className="space-y-2">
                <div className="aspect-square overflow-hidden rounded-[var(--radius-lg)] bg-muted">
                  {/* Product image would go here */}
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Package className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <p className="line-clamp-1 font-medium transition-colors group-hover:text-primary">
                    Product #{rec.productId.slice(-6)}
                  </p>
                  <p className="line-clamp-1 text-muted-foreground text-xs">
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
