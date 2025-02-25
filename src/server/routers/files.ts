import { randomUUID } from 'crypto';
import { parse } from 'superjson';

import { env } from '@/env.mjs';
import { zUploadSignedUrlInput, zUploadSignedUrlOutput } from '@/files/schemas';
import { getS3UploadSignedUrl } from '@/server/config/s3';
import { createTRPCRouter, protectedProcedure } from '@/server/config/trpc';

export const filesRouter = createTRPCRouter({
  uploadPresignedUrl: protectedProcedure()
    .meta({
      openapi: {
        method: 'GET',
        path: '/files/upload-presigned-url',
        tags: ['files'],
        protect: true,
      },
    })
    .input(zUploadSignedUrlInput())
    .output(zUploadSignedUrlOutput())
    .mutation(async ({ input }) => {
      return await getS3UploadSignedUrl({
        key: randomUUID(),
        host: env.S3_BUCKET_PUBLIC_URL,
        metadata: parse(input?.metadata ?? ''),
      });
    }),
});
