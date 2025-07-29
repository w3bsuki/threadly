import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

export const uploadthingRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 10 } })
    .middleware(async () => {
      // Add authentication logic here
      // const user = await auth(req);
      // if (!user) throw new UploadThingError("Unauthorized");
      
      return { userId: 'user-id' }; // Replace with actual user ID
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  documentUploader: f({ 
    pdf: { maxFileSize: '16MB' },
    text: { maxFileSize: '8MB' }
  })
    .middleware(async () => {
      // Add authentication logic here
      return { userId: 'user-id' };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  avatarUploader: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(async () => {
      // Add authentication logic here
      return { userId: 'user-id' };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Update user avatar in database
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadthingRouter;