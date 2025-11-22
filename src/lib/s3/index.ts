import { minio } from '@better-upload/server/clients';

import { envServer } from '@/env/server';

// cf. https://better-upload.com/docs/helpers-server#s3-clients to
// see all available clients.
export const uploadClient = minio({
  endpoint: envServer.S3_ENDPOINT,
  accessKeyId: envServer.S3_ACCESS_KEY_ID,
  secretAccessKey: envServer.S3_SECRET_ACCESS_KEY,
  region: envServer.S3_REGION,
});
