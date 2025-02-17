import { z } from 'zod';

import { env } from '@/env.mjs';
import { zUploadSignedUrlOutput } from '@/files/schemas';
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
    .input(
      z
        .object({
          metadata: z.record(z.string(), z.string()),
        })
        .optional()
    )
    .output(zUploadSignedUrlOutput())
    .mutation(async ({ input, ctx }) => {
      return await getS3UploadSignedUrl({
        key: ctx.user.id, // FIX ME
        host: env.S3_BUCKET_PUBLIC_URL,
        metadata: input?.metadata,
      });
    }),
});
