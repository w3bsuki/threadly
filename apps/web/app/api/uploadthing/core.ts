import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { currentUser } from "@repo/auth/server";
import { log } from "@repo/observability/server";
import { logError } from "@repo/observability/server";

const f = createUploadthing({
  errorFormatter: (err) => {
    logError("UploadThing error", { 
      message: err.message, 
      cause: err.cause,
      stack: err.stack 
    });

    return { message: "Upload failed. Please try again." };
  },
});

const PRODUCTION_FILE_LIMITS = {
  maxFileSize: "8MB" as const,
  maxFileCount: 8,
  
  allowedTypes: ["image/jpeg", "image/png", "image/webp"] as const,
  
  rateLimits: {
    uploads: 20,
    totalSize: "50MB"
  }
};

export const ourFileRouter = {
  productImages: f({ 
    image: { 
      maxFileSize: PRODUCTION_FILE_LIMITS.maxFileSize, 
      maxFileCount: PRODUCTION_FILE_LIMITS.maxFileCount
    } 
  })
    .middleware(async ({ req }) => {
      try {
        console.log('=== UPLOADTHING MIDDLEWARE START ===');
        console.log('Request headers:', Object.fromEntries(req.headers.entries()));
        console.log('Checking authentication for upload');
        
        const user = await currentUser();
        console.log('Current user result:', user ? { 
          id: user.id, 
          email: user.emailAddresses[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName
        } : 'Not authenticated');
        
        if (!user) {
          console.error('No user found - authentication failed');
          log.warn("Unauthorized upload attempt", { 
            ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
            userAgent: req.headers.get("user-agent")
          });
          throw new UploadThingError("Authentication required");
        }

        const now = new Date();
        log.info("File upload started", { 
          userId: user.id,
          timestamp: now.toISOString(),
          userAgent: req.headers.get("user-agent")
        });

        console.log('=== UPLOADTHING MIDDLEWARE SUCCESS ===');
        return { 
          userId: user.id,
          userEmail: user.emailAddresses[0]?.emailAddress,
          uploadTime: now.getTime()
        };
      } catch (error) {
        console.error('=== UPLOADTHING MIDDLEWARE ERROR ===');
        console.error('Middleware error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          error
        });
        throw error;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        log.info("File upload completed", {
          userId: metadata.userId,
          fileUrl: file.url,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadDuration: Date.now() - metadata.uploadTime
        });

        if (!file.url || !file.name) {
          throw new Error("Invalid file upload response");
        }

        return { 
          success: true,
          url: file.url,
          name: file.name,
          size: file.size
        };
      } catch (error) {
        logError("Upload completion error", { 
          error, 
          metadata,
          file: { url: file.url, name: file.name, size: file.size }
        });
        
        return { 
          success: false, 
          error: "Upload processing failed" 
        };
      }
    }),

  avatarImages: f({ 
    image: { 
      maxFileSize: "2MB", 
      maxFileCount: 1
    } 
  })
    .middleware(async ({ req }) => {
      const user = await currentUser();
      if (!user) throw new UploadThingError("Authentication required");
      
      return { 
        userId: user.id,
        uploadTime: Date.now()
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      log.info("Avatar upload completed", {
        userId: metadata.userId,
        fileUrl: file.url
      });

      return { 
        success: true,
        url: file.url 
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;