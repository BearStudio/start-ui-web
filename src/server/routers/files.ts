import { TRPCError } from '@trpc/server';
import { parse } from 'superjson';
import { match } from 'ts-pattern';
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
      z.object({
        /**
         * Must be a string as trpc-openapi requires that attributes must be serialized
         */
        metadata: z.string().optional(),
        type: z.enum(['avatar']),
      })
    )
    .output(zUploadSignedUrlOutput())
    .mutation(async ({ input, ctx }) => {
      return await getS3UploadSignedUrl({
        key: match(input.type)
          .with('avatar', () => ctx.user.id)
          .exhaustive(),
        host: env.S3_BUCKET_PUBLIC_URL,
        metadata: input.metadata ? parse(input.metadata) : undefined,
      });
    }),
});
