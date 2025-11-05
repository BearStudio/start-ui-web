import { S3Client } from '@aws-sdk/client-s3';

import { envServer } from '@/env/server';

export const s3client = new S3Client({
  endpoint: envServer.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: envServer.S3_ACCESS_KEY_ID,
    secretAccessKey: envServer.S3_SECRET_ACCESS_KEY,
  },
  region: envServer.S3_REGION,
});
