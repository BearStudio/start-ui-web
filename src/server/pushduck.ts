import { createUploadConfig } from 'pushduck/server';

import { envServer } from '@/env/server';

const { s3 } = createUploadConfig()
  .provider('minio', {
    endpoint: envServer.S3_HOST,
    accessKeyId: envServer.S3_ACCESS_KEY_ID,
    secretAccessKey: envServer.S3_SECRET_ACCESS_KEY,
    bucket: envServer.S3_BUCKET_NAME,
    useSSL: envServer.S3_SECURE,
  })
  .build();

export const uploadRouter = s3.createRouter({
  bookCover: s3
    .image()
    .types(['image/png', 'image/jpeg', 'image/gif', 'image/webp'])
    .maxFileSize('100MB'),
});

export type PushduckUploadRouter = typeof uploadRouter;
