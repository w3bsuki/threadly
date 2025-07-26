'use client';

import { useState, useCallback, useRef } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { X, Upload, Image as ImageIcon, Loader2, AlertCircle, GripVertical } from 'lucide-react';
import { ImagePreview } from './image-preview';
import { ImageGallery } from './image-gallery';
import { UploadProgress } from './upload-progress';
import type { ImageData, ImageUploadProps, UploadFile } from './types';

export function ImageUpload({
  value = [],
  onChange,
  onUpload,
  maxFiles = 5,
  maxSize = 8 * 1024 * 1024,
  accept = 'image/*',
  multiple = true,
  reorderable = false,
  disabled = false,
  className,
  dropzoneClassName,
  previewClassName,
  errorClassName,
}: ImageUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSize) {
      return `File "${file.name}" exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`;
    }
    
    if (accept && accept !== 'image/*') {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileType = file.type;
      const fileExtension = `.${file.name.split('.').pop()}`;
      
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension.toLowerCase() === type.toLowerCase();
        }
        return fileType.match(new RegExp(type.replace('*', '.*')));
      });
      
      if (!isAccepted) {
        return `File type "${fileType}" is not accepted`;
      }
    }
    
    return null;
  }, [maxSize, accept]);

  const handleFiles = useCallback(async (files: FileList) => {
    if (disabled) return;
    
    const fileArray = Array.from(files);
    const currentCount = value.length + uploadingFiles.length;
    const availableSlots = maxFiles - currentCount;
    
    if (availableSlots <= 0) {
      setErrors([`Maximum ${maxFiles} files allowed`]);
      return;
    }
    
    const filesToProcess = fileArray.slice(0, availableSlots);
    const newErrors: string[] = [];
    const validFiles: File[] = [];
    
    filesToProcess.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });
    
    if (fileArray.length > availableSlots) {
      newErrors.push(`Only ${availableSlots} more file(s) can be added`);
    }
    
    setErrors(newErrors);
    
    if (validFiles.length === 0) return;
    
    const newUploadFiles: UploadFile[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending',
      id: `${Date.now()}-${Math.random()}`,
    }));
    
    setUploadingFiles(prev => [...prev, ...newUploadFiles]);
    
    for (const uploadFile of newUploadFiles) {
      try {
        const result = await onUpload(uploadFile.file, (progress) => {
          setUploadingFiles(prev =>
            prev.map(f =>
              f.id === uploadFile.id
                ? { ...f, progress, status: 'uploading' }
                : f
            )
          );
        });
        
        setUploadingFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id
              ? { ...f, status: 'completed', result }
              : f
          )
        );
        
        const newImage: ImageData = {
          url: result.url,
          alt: result.alt || uploadFile.file.name,
          order: value.length + newUploadFiles.indexOf(uploadFile),
          id: result.id,
        };
        
        const updatedValue = [...value, newImage];
        onChange(updatedValue);
        
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.id !== uploadFile.id));
        }, 1000);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setUploadingFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id
              ? { ...f, status: 'error', error: errorMessage }
              : f
          )
        );
        
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.id !== uploadFile.id));
        }, 3000);
      }
    }
  }, [value, uploadingFiles, maxFiles, disabled, validateFile, onUpload, onChange]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragActive(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeImage = useCallback((index: number) => {
    const updatedImages = value.filter((_, i) => i !== index);
    onChange(updatedImages);
  }, [value, onChange]);

  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    if (!reorderable) return;
    
    const updatedImages = [...value];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    
    const reorderedImages = updatedImages.map((img, index) => ({
      ...img,
      order: index,
    }));
    
    onChange(reorderedImages);
  }, [value, onChange, reorderable]);

  const isUploading = uploadingFiles.some(f => f.status === 'uploading');
  const canAddMore = value.length + uploadingFiles.length < maxFiles;

  return (
    <div className={cn('space-y-4', className)}>
      <Card
        className={cn(
          'border-2 border-dashed transition-all',
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          disabled && 'opacity-50 cursor-not-allowed',
          dropzoneClassName
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled || !canAddMore}
          />
          
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          
          <div className="mt-4">
            <Button
              type="button"
              variant="link"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || !canAddMore || isUploading}
              className="text-sm font-medium"
            >
              {isUploading ? 'Uploading...' : 'Click to upload'}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {accept === 'image/*' ? 'PNG, JPG, GIF' : accept} up to {Math.round(maxSize / 1024 / 1024)}MB
              {maxFiles > 1 && ` (${value.length}/${maxFiles} files)`}
            </p>
          </div>
        </div>
      </Card>

      {errors.length > 0 && (
        <div className={cn('space-y-2', errorClassName)}>
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map(file => (
            <UploadProgress key={file.id} file={file} />
          ))}
        </div>
      )}

      {value.length > 0 && (
        <ImageGallery
          images={value}
          onRemove={removeImage}
          onReorder={reorderable ? reorderImages : undefined}
          className={previewClassName}
        />
      )}

      {value.length === 0 && uploadingFiles.length === 0 && (
        <div className="text-center py-8">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            No images uploaded yet
          </p>
        </div>
      )}
    </div>
  );
}