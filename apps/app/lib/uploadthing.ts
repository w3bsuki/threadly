import { generateReactHelpers } from "@uploadthing/react";

import type { OurFileRouter } from "../app/api/uploadthing/core";

const helpers = generateReactHelpers<OurFileRouter>();

export const useUploadThing = helpers.useUploadThing;
export const uploadFiles = helpers.uploadFiles;