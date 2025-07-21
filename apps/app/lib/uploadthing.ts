import { generateReactHelpers } from "@uploadthing/react";

import type { OurFileRouter } from "../app/api/uploadthing/core";

// Use type assertion to avoid TypeScript inference issues
export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>() as any;