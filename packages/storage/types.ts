export interface UploadOptions {
  key?: string;
  contentType?: string;
  metadata?: Record<string, string>;
  acl?: 'private' | 'public-read';
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

export interface DeleteOptions {
  keys: string[];
}

export interface DeleteResult {
  success: boolean;
  deletedKeys: string[];
  errors?: Record<string, string>;
}

export interface PresignedUrlOptions {
  key: string;
  expiresIn?: number;
  operation?: 'get' | 'put';
}

export interface ListOptions {
  prefix?: string;
  maxKeys?: number;
  continuationToken?: string;
}

export interface ListResult {
  keys: string[];
  isTruncated: boolean;
  continuationToken?: string;
}