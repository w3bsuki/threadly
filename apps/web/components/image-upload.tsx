'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components';
import { Card } from '@repo/design-system/components';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@repo/design-system/lib/utils';
import { useUploadThing } from '@/lib/uploadthing';
import Image from 'next/image';

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

export function ImageUpload({ value, onChange, maxFiles = 5 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload, isUploading: isUploadThingUploading } = useUploadThing("productImages", {
    onClientUploadComplete: (res: Array<{ url: string }>) => {
      const newImages = res?.map((file, index) => ({
        url: file.url,
        alt: `Product image ${value.length + index + 1}`,
        order: value.length + index
      })) || [];
      const updatedImages = [...value, ...newImages].slice(0, maxFiles);
      onChange(updatedImages);
      setIsUploading(false);
    },
    onUploadError: (error: Error) => {
      setIsUploading(false);
      
      
      if (error.message.includes('auth') || error.message.includes('Authentication')) {
        alert('Authentication required. Please log in to upload images.');
      } else if (error.message.includes('rate')) {
        alert('Too many uploads. Please wait a moment and try again.');
      } else if (error.message.includes('size')) {
        alert('File is too large. Please choose files under 8MB.');
      } else {
        alert(`Failed to upload image: ${error.message || 'Unknown error'}. Please try again.`);
      }
    },
    onUploadBegin: (name: string) => {
      setIsUploading(true);
    },
  });

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;
    
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
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
        alert("Upload failed. Please check your internet connection and try again.");
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
          "border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors",
          isUploading && "border-primary"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="p-4 sm:p-6 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
            id="image-upload"
            disabled={isUploading || isUploadThingUploading || value.length >= maxFiles}
          />
          
          <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-[var(--radius-lg)] bg-muted">
            <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
          </div>
          
          <div className="mt-3 sm:mt-4">
            <label
              htmlFor="image-upload"
              className={cn(
                "cursor-pointer text-sm font-medium text-primary hover:text-primary/80 touch-manipulation",
                (isUploading || isUploadThingUploading || value.length >= maxFiles) && "cursor-not-allowed opacity-50"
              )}
            >
              {(isUploading || isUploadThingUploading) ? 'Uploading...' : 'Tap to add photos'}
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, GIF up to 8MB ({value.length}/{maxFiles} images)
            </p>
          </div>
        </div>
      </Card>

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {value.map((image, index) => (
            <Card key={index} className="relative overflow-hidden group">
              <div className="aspect-square relative">
                <Image
                  src={image.url}
                  alt={image.alt || `Product image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-7 w-7 sm:h-6 sm:w-6 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                </Button>
                {index === 0 && (
                  <div className="absolute bottom-1 left-1 bg-foreground/80 text-background text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-sm">
                    Main
                  </div>
                )}
              </div>
            </Card>
          ))}
          {value.length < maxFiles && (
            <label
              htmlFor="image-upload"
              className={cn(
                "aspect-square border-2 border-dashed border-muted-foreground/25 rounded-[var(--radius-md)] flex items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors touch-manipulation",
                (isUploading || isUploadThingUploading) && "cursor-not-allowed opacity-50"
              )}
            >
              <Upload className="h-5 w-5 text-muted-foreground/50" />
            </label>
          )}
        </div>
      )}

      {value.length === 0 && (
        <div className="text-center py-6 sm:py-8">
          <ImageIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Add photos to help buyers see your item
          </p>
        </div>
      )}
    </div>
  );
}