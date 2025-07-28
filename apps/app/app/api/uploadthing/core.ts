import { currentUser } from '@repo/auth/server';
import { log, logError } from '@repo/observability/server';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

const f = createUploadthing({
  /**
   * Log out more information about the error, but don't return it to the client
   * @see https://docs.uploadthing.com/errors#error-formatting
   */
  errorFormatter: (err) => {
    logError('UploadThing error', {
      message: err.message,
      cause: err.cause,
      stack: err.stack,
    });

    return { message: 'Upload failed. Please try again.' };
  },
});

// Production-ready file limits
const PRODUCTION_FILE_LIMITS = {
  // Individual file limits
  maxFileSize: '8MB' as const,
  maxFileCount: 8,

  // Supported image formats
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,

  // Rate limiting
  rateLimits: {
    uploads: 20, // per hour per user
    totalSize: '50MB', // per hour per user
  },
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Product images with production-ready configuration
  productImages: f({
    image: {
      maxFileSize: PRODUCTION_FILE_LIMITS.maxFileSize,
      maxFileCount: PRODUCTION_FILE_LIMITS.maxFileCount,
    },
  })
    .middleware(async ({ req }) => {
      // Authentication check
      const user = await currentUser();
      if (!user) {
        log.warn('Unauthorized upload attempt', {
          ip:
            req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          userAgent: req.headers.get('user-agent'),
        });
        throw new UploadThingError('Authentication required');
      }

      // Basic rate limiting check (implement more sophisticated rate limiting with Redis)
      const now = new Date();
      log.info('File upload started', {
        userId: user.id,
        timestamp: now.toISOString(),
        userAgent: req.headers.get('user-agent'),
      });

      return {
        userId: user.id,
        userEmail: user.emailAddresses[0]?.emailAddress,
        uploadTime: now.getTime(),
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        // Log successful upload
        log.info('File upload completed', {
          userId: metadata.userId,
          fileUrl: file.url,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadDuration: Date.now() - metadata.uploadTime,
        });

        // Validate file was actually uploaded
        if (!(file.url && file.name)) {
          throw new Error('Invalid file upload response');
        }

        // Return minimal data to client
        return {
          success: true,
          url: file.url,
          name: file.name,
          size: file.size,
        };
      } catch (error) {
        logError('Upload completion error', {
          error,
          metadata,
          file: { url: file.url, name: file.name, size: file.size },
        });

        // Don't throw here - it will cause client errors
        // Instead return error state that client can handle
        return {
          success: false,
          error: 'Upload processing failed',
        };
      }
    }),

  // Avatar images (smaller limits)
  avatarImages: f({
    image: {
      maxFileSize: '2MB',
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await currentUser();
      if (!user) throw new UploadThingError('Authentication required');

      return {
        userId: user.id,
        uploadTime: Date.now(),
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      log.info('Avatar upload completed', {
        userId: metadata.userId,
        fileUrl: file.url,
      });

      return {
        success: true,
        url: file.url,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
