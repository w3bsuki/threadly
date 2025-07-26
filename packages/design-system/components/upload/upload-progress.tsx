'use client';

import { cn } from '../../lib/utils';
import { Progress } from '../ui/progress';
import { Card } from '../ui/card';
import { CheckCircle2, XCircle, Loader2, FileImage } from 'lucide-react';
import type { UploadProgressProps } from './types';

export function UploadProgress({ file, className }: UploadProgressProps) {
  const getIcon = () => {
    switch (file.status) {
      case 'pending':
        return <FileImage className="h-4 w-4 text-muted-foreground" />;
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusText = () => {
    switch (file.status) {
      case 'pending':
        return 'Waiting...';
      case 'uploading':
        return `Uploading... ${Math.round(file.progress)}%`;
      case 'completed':
        return 'Upload complete';
      case 'error':
        return file.error || 'Upload failed';
    }
  };

  return (
    <Card
      className={cn(
        'p-3 transition-all',
        file.status === 'completed' && 'bg-green-50 dark:bg-green-950/20',
        file.status === 'error' && 'bg-red-50 dark:bg-red-950/20',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{getIcon()}</div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {file.file.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {getStatusText()}
          </p>
        </div>
        
        <div className="flex-shrink-0 text-xs text-muted-foreground">
          {(file.file.size / 1024 / 1024).toFixed(1)}MB
        </div>
      </div>
      
      {file.status === 'uploading' && (
        <div className="mt-2">
          <Progress value={file.progress} className="h-1" />
        </div>
      )}
    </Card>
  );
}