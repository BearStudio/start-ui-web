import { minio } from 'better-upload/server/helpers';

import { envServer } from '@/env/server';

export const s3client = minio({
  endpoint: envServer.OBJECT_STORAGE_ENTRYPOINT,
  accessKeyId: envServer.OBJECT_STORAGE_ACCESS_KEY,
  secretAccessKey: envServer.OBJECT_STORAGE_SECRET_KEY,
  region: envServer.OBJECT_STORAGE_REGION,
});
