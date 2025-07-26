# Image Upload Components

A comprehensive set of image upload components with drag & drop support, progress tracking, and uploadthing integration.

## Components

### ImageUpload
Main upload component with drag & drop, progress tracking, and error handling.

### ImagePreview
Individual image preview with remove and reorder functionality.

### ImageGallery
Gallery view for uploaded images with drag & drop reordering.

### UploadProgress
Progress indicator for uploading files.

### UploadthingImageUpload
Wrapper component for easy integration with uploadthing.

## Usage

### Basic Usage with Custom Upload Handler

```tsx
import { ImageUpload } from '@repo/design-system/components';
import type { ImageData, UploadResult } from '@repo/design-system/components';

function ProductImageUpload() {
  const [images, setImages] = useState<ImageData[]>([]);

  const handleUpload = async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    return {
      url: data.url,
      id: data.id,
      alt: data.alt,
    };
  };

  return (
    <ImageUpload
      value={images}
      onChange={setImages}
      onUpload={handleUpload}
      maxFiles={5}
      reorderable
    />
  );
}
```

### Usage with Uploadthing

```tsx
import { UploadthingImageUpload } from '@repo/design-system/components';
import { useUploadThing } from '@/lib/uploadthing';

function ProductImages() {
  const [images, setImages] = useState<ImageData[]>([]);

  return (
    <UploadthingImageUpload
      value={images}
      onChange={setImages}
      useUploadThing={useUploadThing}
      endpoint="productImages"
      maxFiles={10}
      reorderable
    />
  );
}
```

### Single Image Upload

```tsx
import { ImageUpload } from '@repo/design-system/components';

function AvatarUpload() {
  const [avatar, setAvatar] = useState<ImageData | null>(null);

  return (
    <ImageUpload
      value={avatar ? [avatar] : []}
      onChange={(images) => setAvatar(images[0] || null)}
      onUpload={handleUpload}
      maxFiles={1}
      multiple={false}
      accept="image/png,image/jpeg"
    />
  );
}
```

## Props

### ImageUpload Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `ImageData[]` | `[]` | Array of uploaded images |
| onChange | `(images: ImageData[]) => void` | - | Callback when images change |
| onUpload | `(file: File, onProgress?: (progress: number) => void) => Promise<UploadResult>` | - | Upload handler function |
| maxFiles | `number` | `5` | Maximum number of files |
| maxSize | `number` | `8388608` (8MB) | Maximum file size in bytes |
| accept | `string` | `'image/*'` | Accepted file types |
| multiple | `boolean` | `true` | Allow multiple file selection |
| reorderable | `boolean` | `false` | Enable drag & drop reordering |
| disabled | `boolean` | `false` | Disable the upload component |
| className | `string` | - | Additional CSS classes |
| dropzoneClassName | `string` | - | CSS classes for dropzone |
| previewClassName | `string` | - | CSS classes for preview area |
| errorClassName | `string` | - | CSS classes for error messages |

### UploadthingImageUpload Props

Extends ImageUpload props with:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| useUploadThing | `Function` | - | uploadthing hook |
| endpoint | `string` | `'imageUploader'` | uploadthing endpoint |

## Types

```typescript
interface ImageData {
  url: string;
  alt?: string;
  order: number;
  id?: string;
}

interface UploadResult {
  url: string;
  id?: string;
  alt?: string;
}
```

## Features

- **Drag & Drop**: Intuitive drag and drop interface
- **Progress Tracking**: Real-time upload progress for each file
- **Error Handling**: Comprehensive error messages and validation
- **Image Preview**: Preview uploaded images with ability to remove
- **Reorderable**: Drag images to reorder (when enabled)
- **Responsive**: Works on all screen sizes
- **Accessible**: Keyboard navigation and screen reader support
- **File Validation**: Size and type validation
- **Multiple Selection**: Support for single or multiple files