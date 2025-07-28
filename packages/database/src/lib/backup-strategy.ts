export interface BackupConfig {
  enabled: boolean;
  schedule: string;
  retention: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  storage: {
    type: 'local' | 's3' | 'gcs' | 'azure';
    bucket?: string;
    path?: string;
  };
  encryption: {
    enabled: boolean;
    algorithm?: string;
  };
  notifications: {
    email?: string[];
    webhook?: string;
  };
}

export const backupStrategy: BackupConfig = {
  enabled: process.env.DATABASE_BACKUP_ENABLED === 'true',
  schedule: process.env.DATABASE_BACKUP_SCHEDULE || '0 3 * * *',
  retention: {
    daily: Number.parseInt(process.env.DATABASE_BACKUP_RETENTION_DAILY || '7'),
    weekly: Number.parseInt(
      process.env.DATABASE_BACKUP_RETENTION_WEEKLY || '4'
    ),
    monthly: Number.parseInt(
      process.env.DATABASE_BACKUP_RETENTION_MONTHLY || '6'
    ),
  },
  storage: {
    type: (process.env.DATABASE_BACKUP_STORAGE_TYPE as any) || 's3',
    bucket: process.env.DATABASE_BACKUP_BUCKET,
    path: process.env.DATABASE_BACKUP_PATH || '/backups',
  },
  encryption: {
    enabled: process.env.DATABASE_BACKUP_ENCRYPTION === 'true',
    algorithm:
      process.env.DATABASE_BACKUP_ENCRYPTION_ALGORITHM || 'aes-256-gcm',
  },
  notifications: {
    email: process.env.DATABASE_BACKUP_EMAIL?.split(',').map((e) => e.trim()),
    webhook: process.env.DATABASE_BACKUP_WEBHOOK,
  },
};

export const getBackupCommand = (
  databaseUrl: string,
  outputPath: string
): string => {
  const url = new URL(databaseUrl);
  const dbName = url.pathname.slice(1);
  const host = url.hostname;
  const port = url.port || '5432';
  const username = url.username;

  return `PGPASSWORD="${url.password}" pg_dump -h ${host} -p ${port} -U ${username} -d ${dbName} -Fc -f ${outputPath}`;
};

export const getRestoreCommand = (
  databaseUrl: string,
  backupPath: string
): string => {
  const url = new URL(databaseUrl);
  const dbName = url.pathname.slice(1);
  const host = url.hostname;
  const port = url.port || '5432';
  const username = url.username;

  return `PGPASSWORD="${url.password}" pg_restore -h ${host} -p ${port} -U ${username} -d ${dbName} -c ${backupPath}`;
};

export const getBackupFileName = (prefix = 'backup'): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${prefix}_${year}${month}${day}_${hour}${minute}.dump`;
};

export const shouldRetainBackup = (
  backupDate: Date,
  config: BackupConfig
): { retain: boolean; reason: string } => {
  const now = new Date();
  const ageInDays = Math.floor(
    (now.getTime() - backupDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (ageInDays <= config.retention.daily) {
    return { retain: true, reason: 'daily' };
  }

  const isWeeklyBackup = backupDate.getDay() === 0;
  if (isWeeklyBackup && ageInDays <= config.retention.weekly * 7) {
    return { retain: true, reason: 'weekly' };
  }

  const isMonthlyBackup = backupDate.getDate() === 1;
  if (isMonthlyBackup && ageInDays <= config.retention.monthly * 30) {
    return { retain: true, reason: 'monthly' };
  }

  return { retain: false, reason: 'expired' };
};

export interface BackupMetadata {
  id: string;
  timestamp: Date;
  size: number;
  duration: number;
  status: 'success' | 'failed';
  error?: string;
  checksum?: string;
  databaseVersion?: string;
  tablesCount?: number;
  recordsCount?: number;
}

export const createBackupMetadata = (
  backup: Partial<BackupMetadata>
): BackupMetadata => {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    size: 0,
    duration: 0,
    status: 'success',
    ...backup,
  };
};

export const validateBackup = async (
  backupPath: string,
  expectedChecksum?: string
): Promise<{ valid: boolean; error?: string }> => {
  try {
    const fs = await import('fs');
    const crypto = await import('crypto');

    if (!fs.existsSync(backupPath)) {
      return { valid: false, error: 'Backup file not found' };
    }

    const stats = fs.statSync(backupPath);
    if (stats.size === 0) {
      return { valid: false, error: 'Backup file is empty' };
    }

    if (expectedChecksum) {
      const fileBuffer = fs.readFileSync(backupPath);
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      if (hash !== expectedChecksum) {
        return { valid: false, error: 'Checksum mismatch' };
      }
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
