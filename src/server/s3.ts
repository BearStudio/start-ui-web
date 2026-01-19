import { custom } from '@better-upload/server/clients';

import { envServer } from '@/env/server';

export const uploadClient = custom({
  host: envServer.S3_HOST,
  accessKeyId: envServer.S3_ACCESS_KEY_ID,
  secretAccessKey: envServer.S3_SECRET_ACCESS_KEY,
  region: envServer.S3_REGION,
  forcePathStyle: envServer.S3_FORCE_PATH_STYLE,
  secure: envServer.S3_SECURE,
});
