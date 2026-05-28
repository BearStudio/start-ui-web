import { z } from 'zod';

import { baseEnvSchema, parseEnv, zNonEmptyEnvString } from './env-schema';

const storageEnvSchema = baseEnvSchema.extend({
  S3_ACCESS_KEY_ID: zNonEmptyEnvString(),
  S3_SECRET_ACCESS_KEY: zNonEmptyEnvString(),
  S3_BUCKET_NAME: zNonEmptyEnvString().default('default'),
  S3_REGION: zNonEmptyEnvString().default('auto'),
  S3_HOST: zNonEmptyEnvString(),
  S3_SECURE: z.stringbool().default(true),
  S3_FORCE_PATH_STYLE: z.stringbool().default(false),
});

export type StorageConfig = {
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
  host: string;
  secure: boolean;
  forcePathStyle: boolean;
};

let cachedStorageConfig: StorageConfig | undefined;

export function getStorageConfig(): StorageConfig {
  if (cachedStorageConfig) return cachedStorageConfig;

  const env = parseEnv(storageEnvSchema);
  cachedStorageConfig = {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    bucketName: env.S3_BUCKET_NAME,
    region: env.S3_REGION,
    host: env.S3_HOST,
    secure: env.S3_SECURE,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
  };
  return cachedStorageConfig;
}
