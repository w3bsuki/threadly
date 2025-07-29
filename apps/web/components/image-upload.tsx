'use client';

import { Button, Card } from '@repo/ui/components';
import { cn } from '@repo/ui/lib/utils';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useUploadThing } from '@/lib/uploadthing';

interface ImageData {
  url: string;
  alt?: string;
  order: number;
  id?: string;
}

interface ImageUploadProps {
  value: ImageData[];
  onChange: (images: ImageData[]) => void;
  maxFiles?: number;
}

export function ImageUpload({
  value,
  onChange,
  maxFiles = 5,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload, isUploading: isUploadThingUploading } = useUploadThing(
    'productImages',
    {
      onClientUploadComplete: (res: Array<{ url: string }>) => {
        const newImages =
          res?.map((file, index) => ({
            url: file.url,
            alt: `Product image ${value.length + index + 1}`,
            order: value.length + index,
          })) || [];
        const updatedImages = [...value, ...newImages].slice(0, maxFiles);
        onChange(updatedImages);
        setIsUploading(false);
      },
      onUploadError: (error: Error) => {
        setIsUploading(false);

        if (
          error.message.includes('auth') ||
          error.message.includes('Authentication')
        ) {
          alert('Authentication required. Please log in to upload images.');
        } else if (error.message.includes('rate')) {
          alert('Too many uploads. Please wait a moment and try again.');
        } else if (error.message.includes('size')) {
          alert('File is too large. Please choose files under 8MB.');
        } else {
          alert(
            `Failed to upload image: ${error.message || 'Unknown error'}. Please try again.`
          );
        }
      },
      onUploadBegin: (name: string) => {
        setIsUploading(true);
      },
    }
  );

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((file) => {
      if (file.size > 8 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Please choose files under 8MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    try {
      await startUpload(validFiles);
    } catch (error) {
      if (error instanceof Error) {
        alert(`Upload failed: ${error.message}`);
      } else {
        alert(
          'Upload failed. Please check your internet connection and try again.'
        );
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    const updatedImages = value.filter((_, index) => index !== indexToRemove);
    onChange(updatedImages);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <Card
        className={cn(
          'border-2 border-muted-foreground/25 border-dashed transition-colors hover:border-muted-foreground/50',
          isUploading && 'border-primary'
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="p-4 text-center sm:p-6">
          <input
            accept="image/*"
            className="hidden"
            disabled={
              isUploading || isUploadThingUploading || value.length >= maxFiles
            }
            id="image-upload"
            multiple
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            type="file"
          />

          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-muted sm:h-12 sm:w-12">
            <Upload className="h-5 w-5 text-muted-foreground sm:h-6 sm:w-6" />
          </div>

          <div className="mt-3 sm:mt-4">
            <label
              className={cn(
                'cursor-pointer touch-manipulation font-medium text-primary text-sm hover:text-primary/80',
                (isUploading ||
                  isUploadThingUploading ||
                  value.length >= maxFiles) &&
                  'cursor-not-allowed opacity-50'
              )}
              htmlFor="image-upload"
            >
              {isUploading || isUploadThingUploading
                ? 'Uploading...'
                : 'Tap to add photos'}
            </label>
            <p className="mt-1 text-muted-foreground text-xs">
              PNG, JPG, GIF up to 8MB ({value.length}/{maxFiles} images)
            </p>
          </div>
        </div>
      </Card>

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {value.map((image, index) => (
            <Card className="group relative overflow-hidden" key={index}>
              <div className="relative aspect-square">
                <Image
                  alt={image.alt || `Product image ${index + 1}`}
                  className="object-cover"
                  fill
                  sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
                  src={image.url}
                />
                <Button
                  className="absolute top-1 right-1 h-7 w-7 opacity-90 transition-opacity sm:h-6 sm:w-6 sm:opacity-0 sm:group-hover:opacity-100"
                  onClick={() => removeImage(index)}
                  size="icon"
                  type="button"
                  variant="destructive"
                >
                  <X className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                </Button>
                {index === 0 && (
                  <div className="absolute bottom-1 left-1 rounded-sm bg-foreground/80 px-1.5 py-0.5 text-[10px] text-background sm:px-2 sm:py-1 sm:text-xs">
                    Main
                  </div>
                )}
              </div>
            </Card>
          ))}
          {value.length < maxFiles && (
            <label
              className={cn(
                'flex aspect-square cursor-pointer touch-manipulation items-center justify-center rounded-[var(--radius-md)] border-2 border-muted-foreground/25 border-dashed transition-colors hover:border-muted-foreground/50',
                (isUploading || isUploadThingUploading) &&
                  'cursor-not-allowed opacity-50'
              )}
              htmlFor="image-upload"
            >
              <Upload className="h-5 w-5 text-muted-foreground/50" />
            </label>
          )}
        </div>
      )}

      {value.length === 0 && (
        <div className="py-6 text-center sm:py-8">
          <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground/50 sm:h-12 sm:w-12" />
          <p className="mt-2 text-muted-foreground text-xs sm:text-sm">
            Add photos to help buyers see your item
          </p>
        </div>
      )}
    </div>
  );
}
