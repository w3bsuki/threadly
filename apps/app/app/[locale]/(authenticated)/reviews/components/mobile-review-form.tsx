'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  AlertDescription,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Textarea,
} from '@repo/ui/components';
import { cn } from '@repo/ui/lib/utils';
import { AlertCircle, Camera, Star, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createReview } from '../actions/create-review';
import { uploadReviewPhotos } from '../actions/upload-review-photos';

const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB

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
  photos: z.array(z.instanceof(File)).max(MAX_PHOTOS).optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface MobileReviewFormProps {
  orderId: string;
  productTitle: string;
  productImage?: string;
  sellerName: string;
  onSuccess?: () => void;
}

export function MobileReviewForm({
  orderId,
  productTitle,
  productImage,
  sellerName,
  onSuccess,
}: MobileReviewFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
      photos: [],
    },
    mode: 'onChange',
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (photoFiles.length + files.length > MAX_PHOTOS) {
      setError(`Maximum ${MAX_PHOTOS} photos allowed`);
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > MAX_PHOTO_SIZE) {
        setError('Photos must be less than 5MB');
        return false;
      }
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return false;
      }
      return true;
    });

    const newPhotoFiles = [...photoFiles, ...validFiles];
    setPhotoFiles(newPhotoFiles);
    form.setValue('photos', newPhotoFiles);

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const newPhotoFiles = photoFiles.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotoFiles(newPhotoFiles);
    setPhotoPreviews(newPreviews);
    form.setValue('photos', newPhotoFiles);
  };

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let photoUrls: string[] = [];

      // Upload photos if any
      if (photoFiles.length > 0) {
        const formData = new FormData();
        photoFiles.forEach((file) => {
          formData.append('photo', file);
        });

        const uploadResult = await uploadReviewPhotos(formData);

        if (!uploadResult.success) {
          setError(uploadResult.error || 'Failed to upload photos');
          return;
        }

        photoUrls = uploadResult.urls || [];
      }

      const result = await createReview({
        orderId,
        rating: data.rating,
        comment: data.comment.trim(),
        photoUrls,
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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with Product Info */}
      <div className="sticky top-0 z-10 border-b bg-background">
        <div className="p-4">
          <div className="flex items-center gap-3">
            {productImage && (
              <div className="relative h-16 w-16 overflow-hidden rounded-[var(--radius-lg)]">
                <Image
                  alt={productTitle}
                  className="object-cover"
                  fill
                  src={productImage}
                />
              </div>
            )}
            <div className="flex-1">
              <h2 className="line-clamp-1 font-semibold">{productTitle}</h2>
              <p className="text-muted-foreground text-sm">
                Sold by {sellerName}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6 p-4" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Rating Section - Large touch targets for mobile */}
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-lg">
                  How was your experience?
                </FormLabel>
                <FormControl>
                  <div className="flex justify-center gap-2 py-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        className="transform rounded-[var(--radius-full)] p-2 transition-all hover:bg-muted active:scale-95"
                        key={star}
                        onClick={() => field.onChange(star)}
                        type="button"
                      >
                        <Star
                          className={cn(
                            'h-10 w-10 transition-colors',
                            star <= field.value
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </FormControl>
                {field.value > 0 && (
                  <p className="text-center text-muted-foreground text-sm">
                    {getRatingText(field.value)}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Photo Upload Section */}
          <div className="space-y-2">
            <label className="font-semibold text-lg">
              Add Photos (Optional)
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {photoPreviews.map((preview, index) => (
                <div className="relative flex-shrink-0" key={index}>
                  <div className="relative h-20 w-20 overflow-hidden rounded-[var(--radius-lg)]">
                    <Image
                      alt={`Review photo ${index + 1}`}
                      className="object-cover"
                      fill
                      src={preview}
                    />
                  </div>
                  <button
                    className="-top-2 -right-2 absolute rounded-[var(--radius-full)] bg-destructive p-1 text-destructive-foreground"
                    onClick={() => removePhoto(index)}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {photoFiles.length < MAX_PHOTOS && (
                <label className="flex h-20 w-20 flex-shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-lg)] border-2 border-muted-foreground/25 border-dashed transition-colors hover:border-muted-foreground/50">
                  <input
                    accept="image/*"
                    className="hidden"
                    multiple
                    onChange={handlePhotoUpload}
                    type="file"
                  />
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </label>
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              {photoFiles.length}/{MAX_PHOTOS} photos
            </p>
          </div>

          {/* Comment Section */}
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-lg">
                  Tell us more
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[120px] text-base"
                    maxLength={1000}
                    placeholder="What did you like or dislike? How was the quality?"
                    {...field}
                  />
                </FormControl>
                <p className="text-right text-muted-foreground text-sm">
                  {field.value.length}/1000
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </Form>

      {/* Fixed Bottom Actions */}
      <div className="fixed right-0 bottom-0 left-0 border-t bg-background p-4">
        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={() => router.back()}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={isSubmitting || !form.formState.isValid}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function getRatingText(rating: number): string {
  switch (rating) {
    case 1:
      return 'Poor experience';
    case 2:
      return 'Below average';
    case 3:
      return 'Average';
    case 4:
      return 'Good experience';
    case 5:
      return 'Excellent!';
    default:
      return '';
  }
}
