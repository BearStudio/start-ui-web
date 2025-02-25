import { TRPCError } from '@trpc/server';
import { parse } from 'superjson';

import { FILES_COLLECTIONS_CONFIG } from '@/lib/s3/config';
import {
  zUploadSignedUrlInput,
  zUploadSignedUrlOutput,
} from '@/lib/s3/schemas';
import { validateFile } from '@/lib/s3/utils';
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
    .input(zUploadSignedUrlInput())
    .output(zUploadSignedUrlOutput())
    .mutation(async ({ input, ctx }) => {
      const config = FILES_COLLECTIONS_CONFIG[input.collection];

      if (!config) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `No collection ${input.collection}`,
        });
      }

      const validateFileResult = validateFile({ input, config });

      if (!validateFileResult.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: validateFileResult.error.message,
        });
      }

      return await getS3UploadSignedUrl({
        key: config.getKey({ user: ctx.user }),
        metadata: input.metadata
          ? { name: input.name, ...parse(input.metadata) }
          : undefined,
      });
    }),
});
