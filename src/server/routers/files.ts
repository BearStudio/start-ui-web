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
        name: z.string(),
        fileType: z.string(),
        size: z.number(),
        collection: z.enum(['avatar']),
      })
    )
    .output(zUploadSignedUrlOutput())
    .mutation(async ({ input, ctx }) => {
      const config = match(input)
        .with({ collection: 'avatar' }, () => ({
          key: `avatars/${ctx.user.id}`,
          fileTypes: ['image/png', 'image/jpg'],
          maxSize: 10 * 1024 * 1024,
        }))
        .exhaustive();

      if (input.size >= config.maxSize) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `File size is too big ${input.size}/${config.maxSize}`,
        });
      }

      if (!config.fileTypes.includes(input.fileType)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Incorrect file type ${input.fileType} (authorized: ${config.fileTypes.join(',')})`,
        });
      }

      return await getS3UploadSignedUrl({
        key: config.key,
        host: env.S3_BUCKET_PUBLIC_URL,
        metadata: input.metadata
          ? { name: input.name, ...parse(input.metadata) }
          : undefined,
      });
    }),
});
