'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@repo/design-system/components';
import { Textarea } from '@repo/design-system/components';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/design-system/components';
import { Alert, AlertDescription } from '@repo/design-system/components';
import { Star, Camera, X, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { createReview } from '../actions/create-review';
import { uploadReviewPhotos } from '../actions/upload-review-photos';
import { cn } from '@repo/design-system/lib/utils';

const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5, 'Rating cannot exceed 5 stars'),
  comment: z.string()
    .min(10, 'Review must be at least 10 characters')
    .max(1000, 'Review must be less than 1000 characters')
    .refine((comment) => comment.trim().length >= 10, {
      message: 'Review cannot be empty or contain only spaces'
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
  onSuccess 
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

    const validFiles = files.filter(file => {
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
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result as string]);
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
        photoFiles.forEach(file => {
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
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="p-4">
          <div className="flex items-center gap-3">
            {productImage && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                <Image
                  src={productImage}
                  alt={productTitle}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h2 className="font-semibold line-clamp-1">{productTitle}</h2>
              <p className="text-sm text-muted-foreground">Sold by {sellerName}</p>
            </div>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6">
          {/* Rating Section - Large touch targets for mobile */}
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">How was your experience?</FormLabel>
                <FormControl>
                  <div className="flex justify-center gap-2 py-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => field.onChange(star)}
                        className="p-2 hover:bg-muted rounded-full transition-all transform active:scale-95"
                      >
                        <Star
                          className={cn(
                            "h-10 w-10 transition-colors",
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
                  <p className="text-center text-sm text-muted-foreground">
                    {getRatingText(field.value)}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Photo Upload Section */}
          <div className="space-y-2">
            <label className="text-lg font-semibold">Add Photos (Optional)</label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {photoPreviews.map((preview, index) => (
                <div key={index} className="relative flex-shrink-0">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                    <Image
                      src={preview}
                      alt={`Review photo ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {photoFiles.length < MAX_PHOTOS && (
                <label className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {photoFiles.length}/{MAX_PHOTOS} photos
            </p>
          </div>

          {/* Comment Section */}
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Tell us more</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What did you like or dislike? How was the quality?"
                    maxLength={1000}
                    className="min-h-[120px] text-base"
                    {...field}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground text-right">
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
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting || !form.formState.isValid}
            className="flex-1"
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
    case 1: return 'Poor experience';
    case 2: return 'Below average';
    case 3: return 'Average';
    case 4: return 'Good experience';
    case 5: return 'Excellent!';
    default: return '';
  }
}