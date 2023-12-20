import { randomUUID } from 'crypto';
import { z } from 'zod';

import { env } from '@/env.mjs';
import { getS3UploadSignedUrl } from '@/server/config/s3';
import { createTRPCRouter, protectedProcedure } from '@/server/config/trpc';

export const filesRouter = createTRPCRouter({
  uploadPresignedUrl: protectedProcedure()
    .meta({
      openapi: {
        method: 'POST',
        path: '/files/upload-presigned-url',
        tags: ['files'],
        protect: true,
      },
    })
    .input(
      z.object({
        fileName: z.string(),
      })
    )
    .output(
      z.object({
        signedUrl: z.string(),
        key: z.string(),
        futureFileUrl: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const s3 = await getS3UploadSignedUrl({
        key: `${randomUUID()}-${input.fileName}`,
        acl: 'public-read',
      });
      return {
        signedUrl: s3.signedUrl,
        key: s3.key,
        futureFileUrl: `${env.S3_BUCKET_PUBLIC_URL}/${s3.key}`,
      };
    }),
});
