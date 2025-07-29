'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Textarea,
} from '@repo/ui/components';
import { AlertCircle, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createReview } from '../actions/create-review';

const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, 'Please select a rating')
    .max(5, 'Rating cannot exceed 5 stars'),
  comment: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(1000, 'Review must be less than 1000 characters')
    .refine((comment) => comment.trim().length >= 10, {
      message: 'Review cannot be empty or contain only spaces',
    }),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  orderId: string;
  productTitle: string;
  sellerName: string;
  onSuccess?: () => void;
}

export function ReviewForm({
  orderId,
  productTitle,
  sellerName,
  onSuccess,
}: ReviewFormProps) {
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
        <div className="text-muted-foreground text-sm">
          <p>
            <strong>Product:</strong> {productTitle}
          </p>
          <p>
            <strong>Seller:</strong> {sellerName}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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
                          className="rounded p-1 transition-colors hover:bg-muted"
                          key={star}
                          onClick={() => field.onChange(star)}
                          type="button"
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
                    <p className="text-muted-foreground text-sm">
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
                      className="min-h-[100px]"
                      maxLength={1000}
                      placeholder="Share your experience with this purchase..."
                      {...field}
                    />
                  </FormControl>
                  <p className="text-muted-foreground text-sm">
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
                className="flex-1"
                disabled={isSubmitting || !form.formState.isValid}
                type="submit"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button
                onClick={() => router.back()}
                type="button"
                variant="outline"
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
