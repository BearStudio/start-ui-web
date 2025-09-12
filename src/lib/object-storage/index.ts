import { minio } from 'better-upload/server/helpers';

import { envServer } from '@/env/server';

export const s3client = minio({
  endpoint: envServer.S3_ENDPOINT,
  accessKeyId: envServer.S3_ACCESS_KEY_ID,
  secretAccessKey: envServer.S3_SECRET_ACCESS_KEY,
  region: envServer.S3_REGION,
});
