import { generateReactHelpers } from "@uploadthing/react";

import type { OurFileRouter } from "../app/api/uploadthing/core";

// Use destructuring with type assertion to avoid type inference issues
export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>() as ReturnType<typeof generateReactHelpers<OurFileRouter>>;