import { generateReactHelpers } from "@uploadthing/react";
import type { UseUploadThing, UploadFiles } from "@uploadthing/react";

import type { OurFileRouter } from "../app/api/uploadthing/core";

// Generate helpers with explicit types
const helpers = generateReactHelpers<OurFileRouter>();

export const useUploadThing: UseUploadThing<OurFileRouter> = helpers.useUploadThing;
export const uploadFiles: UploadFiles<OurFileRouter> = helpers.uploadFiles;