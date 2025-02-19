import { TRPCError } from '@trpc/server';
import { parse } from 'superjson';

import { FILES_COLLECTIONS_CONFIG } from '@/lib/s3/config';
import {
  zUploadSignedUrlInput,
  zUploadSignedUrlOutput,
} from '@/lib/s3/schemas';
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

      if (config.maxSize && input.size >= config.maxSize) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `File size is too big ${input.size}/${config.maxSize}`,
        });
      }

      if (config.fileTypes && !config.fileTypes.includes(input.fileType)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Incorrect file type ${input.fileType} (authorized: ${config.fileTypes.join(',')})`,
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
