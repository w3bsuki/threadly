'use server';

import { currentUser } from '@repo/auth/server';
import { logError } from '@repo/observability/server';
import { z } from 'zod';

// Mock implementation for @vercel/blob
const put = async (
  filename: string,
  file: File,
  options: { access: string; contentType: string }
) => {
  // Mock URL for development - in production this would be handled by @vercel/blob
  const mockUrl = `https://mock-storage.example.com/${filename}`;
  return { url: mockUrl };
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const uploadSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .max(5, 'Maximum 5 photos allowed')
    .refine((files) => files.every((file) => file.size <= MAX_FILE_SIZE), {
      message: 'Each file must be less than 5MB',
    })
    .refine(
      (files) => files.every((file) => ALLOWED_FILE_TYPES.includes(file.type)),
      {
        message: 'Only JPEG, PNG, and WebP images are allowed',
      }
    ),
});

export async function uploadReviewPhotos(formData: FormData) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Extract files from FormData
    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key === 'photo' && value instanceof File) {
        files.push(value);
      }
    }

    // Validate files
    const validation = uploadSchema.safeParse({ files });
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Invalid files',
      };
    }

    // Upload files to storage
    const uploadPromises = files.map(async (file) => {
      const filename = `reviews/${user.id}/${Date.now()}-${file.name}`;

      return put(filename, file, {
        access: 'public',
        contentType: file.type,
      });
    });

    const uploadResults = await Promise.allSettled(uploadPromises);

    const urls: string[] = [];
    const errors: string[] = [];

    uploadResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.url) {
        urls.push(result.value.url);
      } else {
        errors.push(`Failed to upload ${files[index]?.name}`);
      }
    });

    if (errors.length > 0) {
      return {
        success: false,
        error: `Some files failed to upload: ${errors.join(', ')}`,
        urls, // Return partial results
      };
    }

    return {
      success: true,
      urls,
    };
  } catch (error) {
    logError('Failed to upload review photos:', error);
    return {
      success: false,
      error: 'Failed to upload photos',
    };
  }
}
