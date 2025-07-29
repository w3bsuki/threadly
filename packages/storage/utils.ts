import { storageEnv } from './keys';

export function generateKey(filename: string, prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '-');
  
  const parts = [prefix, timestamp, random, sanitizedFilename].filter(Boolean);
  return parts.join('-');
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename);
  
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain',
    csv: 'text/csv',
    json: 'application/json',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

export function validateFileSize(size: number): boolean {
  return size <= storageEnv.MAX_FILE_SIZE;
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}