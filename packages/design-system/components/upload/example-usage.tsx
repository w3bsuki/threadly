'use client';

import { useState } from 'react';
import { ImageUpload } from './image-upload';
import type { ImageData, UploadResult } from './types';
import { UploadthingImageUpload } from './uploadthing-image-upload';

// Example 1: Basic usage with custom upload handler
export function BasicImageUploadExample() {
  const [images, setImages] = useState<ImageData[]>([]);

  // Custom upload handler - replace with your actual upload logic
  const handleUpload = async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> => {
    // Simulate upload progress
    if (onProgress) {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        onProgress(i);
      }
    }

    // In real usage, upload to your server/service
    // const formData = new FormData();
    // formData.append('file', file);
    // const response = await fetch('/api/upload', { method: 'POST', body: formData });
    // const data = await response.json();
    // return { url: data.url, id: data.id };

    // Mock response
    return {
      url: URL.createObjectURL(file),
      id: `file-${Date.now()}`,
      alt: file.name,
    };
  };

  return (
    <ImageUpload
      maxFiles={5}
      maxSize={8 * 1024 * 1024}
      multiple
      onChange={setImages}
      onUpload={handleUpload} // 8MB
      reorderable
      value={images}
    />
  );
}

// Example 2: Usage with uploadthing
export function UploadthingExample({
  useUploadThing,
}: {
  useUploadThing: any;
}) {
  const [images, setImages] = useState<ImageData[]>([]);

  return (
    <UploadthingImageUpload
      endpoint="productImages"
      maxFiles={10}
      onChange={setImages}
      reorderable
      useUploadThing={useUploadThing}
      value={images}
    />
  );
}

// Example 3: Single image upload
export function SingleImageUploadExample() {
  const [image, setImage] = useState<ImageData | null>(null);

  const handleUpload = async (file: File): Promise<UploadResult> => {
    // Your upload logic here
    return {
      url: URL.createObjectURL(file),
      id: `file-${Date.now()}`,
    };
  };

  return (
    <ImageUpload
      accept="image/png,image/jpeg"
      maxFiles={1}
      multiple={false}
      onChange={(images) => setImage(images[0] || null)}
      onUpload={handleUpload}
      value={image ? [image] : []}
    />
  );
}

// Example 4: Profile avatar upload
export function AvatarUploadExample() {
  const [avatar, setAvatar] = useState<ImageData | null>(null);

  const handleUpload = async (file: File): Promise<UploadResult> => {
    // Validate and resize for avatar
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Avatar must be less than 2MB');
    }

    // Your upload logic here
    return {
      url: URL.createObjectURL(file),
      id: `avatar-${Date.now()}`,
    };
  };

  return (
    <div className="max-w-xs">
      <ImageUpload
        accept="image/png,image/jpeg,image/webp"
        className="space-y-2"
        dropzoneClassName="h-32"
        maxFiles={1}
        maxSize={2 * 1024 * 1024} // 2MB for avatars
        multiple={false}
        onChange={(images) => setAvatar(images[0] || null)}
        onUpload={handleUpload}
        value={avatar ? [avatar] : []}
      />
    </div>
  );
}
