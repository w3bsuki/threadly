'use client';

import { ImageUpload } from './image-upload';
import type { ImageData, UploadResult } from './types';

export interface UploadthingImageUploadProps {
  value: ImageData[];
  onChange: (images: ImageData[]) => void;
  useUploadThing: (
    endpoint: string,
    options?: any
  ) => {
    startUpload: (
      files: File[]
    ) => Promise<Array<{ url: string; key?: string; name?: string }>>;
    isUploading: boolean;
  };
  endpoint?: string;
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
  reorderable?: boolean;
  disabled?: boolean;
  className?: string;
  dropzoneClassName?: string;
  previewClassName?: string;
  errorClassName?: string;
}

export function UploadthingImageUpload({
  value,
  onChange,
  useUploadThing,
  endpoint = 'imageUploader',
  ...props
}: UploadthingImageUploadProps) {
  const { startUpload, isUploading } = useUploadThing(endpoint);

  const handleUpload = async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> => {
    try {
      if (onProgress) {
        onProgress(0);
        const progressInterval = setInterval(() => {
          onProgress(Math.min(90, Math.random() * 100));
        }, 500);

        const result = await startUpload([file]);

        clearInterval(progressInterval);
        onProgress(100);

        if (!result || result.length === 0) {
          throw new Error('Upload failed');
        }

        const uploadResult = result[0];
        if (!uploadResult) {
          throw new Error('Upload result is empty');
        }
        return {
          url: uploadResult.url,
          id: uploadResult.key,
          alt: uploadResult.name,
        };
      }
      const result = await startUpload([file]);

      if (!result || result.length === 0) {
        throw new Error('Upload failed');
      }

      const uploadResult = result[0];
      if (!uploadResult) {
        throw new Error('Upload result is empty');
      }
      return {
        url: uploadResult.url,
        id: uploadResult.key,
        alt: uploadResult.name,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Upload failed');
    }
  };

  return (
    <ImageUpload
      disabled={props.disabled || isUploading}
      onChange={onChange}
      onUpload={handleUpload}
      value={value}
      {...props}
    />
  );
}
