'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/design-system/components/ui/form';
import { Alert, AlertDescription } from '@repo/design-system/components/ui/alert';
import { Star, AlertCircle } from 'lucide-react';
import { createReview } from '../actions/create-review';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5, 'Rating cannot exceed 5 stars'),
  comment: z.string()
    .min(10, 'Review must be at least 10 characters')
    .max(1000, 'Review must be less than 1000 characters')
    .refine((comment) => comment.trim().length >= 10, {
      message: 'Review cannot be empty or contain only spaces'
    }),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  orderId: string;
  productTitle: string;
  sellerName: string;
  onSuccess?: () => void;
}

export function ReviewForm({ orderId, productTitle, sellerName, onSuccess }: ReviewFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createReview({
        orderId,
        rating: data.rating,
        comment: data.comment.trim(),
      });

      if (result.success) {
        onSuccess?.();
        router.refresh();
      } else {
        setError(result.error || 'Failed to submit review');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentRating = form.watch('rating');
  const currentComment = form.watch('comment');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Your Purchase</CardTitle>
        <div className="text-sm text-muted-foreground">
          <p><strong>Product:</strong> {productTitle}</p>
          <p><strong>Seller:</strong> {sellerName}</p>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Rating */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                          className="p-1 hover:bg-muted rounded transition-colors"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= field.value
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  {field.value > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {field.value} out of 5 stars
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Comment */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience with this purchase..."
                      maxLength={1000}
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    {field.value.length}/1000 characters
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit */}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isValid}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}