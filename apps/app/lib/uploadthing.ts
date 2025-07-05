import { generateReactHelpers } from "@uploadthing/react";

import type { OurFileRouter } from "../app/api/uploadthing/core";

// Generate the helpers without destructuring to avoid type inference issues
const helpers = generateReactHelpers<OurFileRouter>();

// Export individual functions with explicit binding
export const useUploadThing = helpers.useUploadThing;
export const uploadFiles = helpers.uploadFiles;