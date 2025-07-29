# @repo/storage

File storage utilities with support for AWS S3 and UploadThing.

## Installation

This package is part of the monorepo and should be installed as a workspace dependency:

```json
{
  "dependencies": {
    "@repo/storage": "workspace:*"
  }
}
```

## Configuration

Set the following environment variables:

```env
# Storage Provider
STORAGE_PROVIDER=uploadthing # or s3

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=my-bucket

# UploadThing Configuration
UPLOADTHING_SECRET=...
UPLOADTHING_APP_ID=...

# General Settings
MAX_FILE_SIZE=10485760 # 10MB in bytes
```

## Usage

### S3 Storage

```typescript
import { uploadToS3, deleteFromS3, getPresignedUrl, listS3Objects } from '@repo/storage/s3';

// Upload a file
const result = await uploadToS3(buffer, {
  key: 'uploads/image.jpg',
  contentType: 'image/jpeg',
  acl: 'public-read'
});

// Delete files
const deleteResult = await deleteFromS3({
  keys: ['uploads/image1.jpg', 'uploads/image2.jpg']
});

// Get presigned URL
const url = await getPresignedUrl({
  key: 'private/document.pdf',
  expiresIn: 3600 // 1 hour
});

// List objects
const files = await listS3Objects({
  prefix: 'uploads/',
  maxKeys: 100
});
```

### UploadThing

```typescript
import { uploadthingRouter } from '@repo/storage/uploadthing';

// Use in your Next.js API route
export const { GET, POST } = createRouteHandler({
  router: uploadthingRouter,
});

// Client-side usage
import { useUploadThing } from '@uploadthing/react';

const { startUpload } = useUploadThing('imageUploader');
const uploaded = await startUpload(files);
```

### Utilities

```typescript
import { generateKey, getMimeType, validateFileSize, formatFileSize } from '@repo/storage';

// Generate unique key
const key = generateKey('photo.jpg', 'user-123');
// => "user-123-1704067200000-abc123-photo.jpg"

// Get MIME type
const mimeType = getMimeType('document.pdf');
// => "application/pdf"

// Validate file size
const isValid = validateFileSize(5 * 1024 * 1024); // 5MB

// Format file size
const formatted = formatFileSize(1536); // => "1.50 KB"
```

## File Routers

The package includes pre-configured UploadThing file routers:

- `imageUploader` - For images (max 4MB, up to 10 files)
- `documentUploader` - For PDFs and text files (max 16MB)
- `avatarUploader` - For user avatars (max 2MB, single file)

## Exports

- S3: `uploadToS3`, `deleteFromS3`, `getPresignedUrl`, `listS3Objects`
- UploadThing: `uploadthingRouter`, `OurFileRouter`
- Utils: `generateKey`, `getFileExtension`, `getMimeType`, `validateFileSize`, `formatFileSize`
- Types: `UploadOptions`, `UploadResult`, `DeleteOptions`, `DeleteResult`, etc.