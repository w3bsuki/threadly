import 'server-only';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { storageEnv } from './keys';
import type {
  UploadOptions,
  UploadResult,
  DeleteOptions,
  DeleteResult,
  PresignedUrlOptions,
  ListOptions,
  ListResult,
} from './types';

const s3Client = new S3Client({
  region: storageEnv.AWS_REGION,
  credentials: {
    accessKeyId: storageEnv.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: storageEnv.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function uploadToS3(
  file: Buffer | Uint8Array | string,
  options: UploadOptions
): Promise<UploadResult> {
  const key = options.key || `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  const command = new PutObjectCommand({
    Bucket: storageEnv.AWS_S3_BUCKET,
    Key: key,
    Body: file,
    ContentType: options.contentType,
    ACL: options.acl,
    Metadata: options.metadata,
  });

  await s3Client.send(command);

  const url = options.acl === 'public-read'
    ? `https://${storageEnv.AWS_S3_BUCKET}.s3.${storageEnv.AWS_REGION}.amazonaws.com/${key}`
    : await getPresignedUrl({ key, operation: 'get' });

  return {
    key,
    url,
    size: typeof file === 'string' ? Buffer.byteLength(file) : file.length,
    contentType: options.contentType || 'application/octet-stream',
  };
}

export async function deleteFromS3(options: DeleteOptions): Promise<DeleteResult> {
  try {
    const command = new DeleteObjectsCommand({
      Bucket: storageEnv.AWS_S3_BUCKET,
      Delete: {
        Objects: options.keys.map(key => ({ Key: key })),
      },
    });

    const response = await s3Client.send(command);
    
    const deletedKeys = response.Deleted?.map(item => item.Key!).filter(Boolean) || [];
    const errors = response.Errors?.reduce((acc, error) => {
      if (error.Key) {
        acc[error.Key] = error.Message || 'Unknown error';
      }
      return acc;
    }, {} as Record<string, string>);

    return {
      success: !response.Errors || response.Errors.length === 0,
      deletedKeys,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      deletedKeys: [],
      errors: { _error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
}

export async function getPresignedUrl(options: PresignedUrlOptions): Promise<string> {
  const command = options.operation === 'put'
    ? new PutObjectCommand({
        Bucket: storageEnv.AWS_S3_BUCKET,
        Key: options.key,
      })
    : new GetObjectCommand({
        Bucket: storageEnv.AWS_S3_BUCKET,
        Key: options.key,
      });

  return getSignedUrl(s3Client, command, {
    expiresIn: options.expiresIn || 3600, // 1 hour default
  });
}

export async function listS3Objects(options: ListOptions = {}): Promise<ListResult> {
  const command = new ListObjectsV2Command({
    Bucket: storageEnv.AWS_S3_BUCKET,
    Prefix: options.prefix,
    MaxKeys: options.maxKeys || 1000,
    ContinuationToken: options.continuationToken,
  });

  const response = await s3Client.send(command);

  return {
    keys: response.Contents?.map(item => item.Key!).filter(Boolean) || [],
    isTruncated: response.IsTruncated || false,
    continuationToken: response.NextContinuationToken,
  };
}