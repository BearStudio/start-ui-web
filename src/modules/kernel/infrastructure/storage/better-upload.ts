import { custom } from '@better-upload/server/clients';

import { env } from '@/modules/kernel/infrastructure/config/env';

export const uploadClient = custom({
  host: env.S3_HOST,
  accessKeyId: env.S3_ACCESS_KEY_ID,
  secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  region: env.S3_REGION,
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
  secure: env.S3_SECURE,
});
