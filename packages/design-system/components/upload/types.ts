export interface ImageData {
  url: string;
  alt?: string;
  order: number;
  id?: string;
}

export interface UploadResult {
  url: string;
  id?: string;
  alt?: string;
}

export interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  id: string;
  result?: UploadResult;
  error?: string;
}

export interface ImageUploadProps {
  value?: ImageData[];
  onChange: (images: ImageData[]) => void;
  onUpload: (
    file: File,
    onProgress?: (progress: number) => void
  ) => Promise<UploadResult>;
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

export interface ImagePreviewProps {
  image: ImageData;
  onRemove?: () => void;
  onReorder?: {
    onDragStart: () => void;
    onDragEnd: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
  isMain?: boolean;
  isDragging?: boolean;
  className?: string;
}

export interface ImageGalleryProps {
  images: ImageData[];
  onRemove?: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  className?: string;
  gridClassName?: string;
  itemClassName?: string;
}

export interface UploadProgressProps {
  file: UploadFile;
  className?: string;
}
