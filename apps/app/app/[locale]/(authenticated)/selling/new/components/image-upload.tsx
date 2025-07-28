'use client';

import { Button, Card } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useUploadThing } from '@/lib/uploadthing';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
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
        const newUrls = res?.map((file) => file.url) || [];
        const updatedUrls = [...value, ...newUrls].slice(0, maxFiles);
        onChange(updatedUrls);
        setIsUploading(false);
      },
      onUploadError: (error: Error) => {
        setIsUploading(false);

        // Show user-friendly error message
        alert(`Upload failed: ${error.message}. Please try again.`);
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
        // 8MB limit
        alert(`File ${file.name} is too large. Please choose files under 8MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Use UploadThing for actual file upload
    try {
      await startUpload(validFiles);
    } catch (error) {
      alert(
        'Upload failed. Please check your internet connection and try again.'
      );
    }
  };

  const removeImage = (indexToRemove: number) => {
    const updatedUrls = value.filter((_, index) => index !== indexToRemove);
    onChange(updatedUrls);
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
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={cn(
          'border-2 border-muted-foreground/25 border-dashed transition-colors hover:border-muted-foreground/50',
          isUploading && 'border-primary'
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="p-6 text-center">
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

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-muted">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>

          <div className="mt-4">
            <label
              className={cn(
                'cursor-pointer font-medium text-primary text-sm hover:text-primary/80',
                (isUploading ||
                  isUploadThingUploading ||
                  value.length >= maxFiles) &&
                  'cursor-not-allowed opacity-50'
              )}
              htmlFor="image-upload"
            >
              {isUploading || isUploadThingUploading
                ? 'Uploading...'
                : 'Click to upload or drag and drop'}
            </label>
            <p className="mt-1 text-muted-foreground text-xs">
              PNG, JPG, GIF up to 10MB ({value.length}/{maxFiles} images)
            </p>
          </div>
        </div>
      </Card>

      {/* Preview Images */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {value.map((url, index) => (
            <Card className="relative overflow-hidden" key={index}>
              <div className="relative aspect-square">
                <img
                  alt={`Product image ${index + 1}`}
                  className="h-full w-full object-cover"
                  src={url}
                />
                <Button
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => removeImage(index)}
                  size="icon"
                  type="button"
                  variant="destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 rounded bg-foreground/70 px-2 py-1 text-background text-xs">
                    Main
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {value.length === 0 && (
        <div className="py-8 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-muted-foreground text-sm">
            Add photos to help buyers see your item
          </p>
        </div>
      )}
    </div>
  );
}
