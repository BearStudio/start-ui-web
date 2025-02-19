import { TRPCError } from '@trpc/server';
import { parse } from 'superjson';
import { match } from 'ts-pattern';

import {
  UploadSignedUrlInput,
  zUploadSignedUrlInput,
  zUploadSignedUrlOutput,
} from '@/lib/s3/schemas';
import { getS3UploadSignedUrl } from '@/server/config/s3';
import {
  AppContext,
  createTRPCRouter,
  protectedProcedure,
} from '@/server/config/trpc';

const getConfiguration = (input: UploadSignedUrlInput, ctx: AppContext) => {
  return match(input)
    .with({ collection: 'avatar' }, () => ({
      key: `avatars/${ctx.user?.id}`,
      fileTypes: ['image/png', 'image/jpg', 'image/jpeg'],
      maxSize: 5 * 1024 * 1024, // 5MB in bytes,
    }))
    .exhaustive();
};

const validateOrThrowFromConfig = (
  input: UploadSignedUrlInput,
  configuration: ReturnType<typeof getConfiguration>
) => {
  if (input.size >= configuration.maxSize) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `File size is too big ${input.size}/${configuration.maxSize}`,
    });
  }

  if (!configuration.fileTypes.includes(input.fileType)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Incorrect file type ${input.fileType} (authorized: ${configuration.fileTypes.join(',')})`,
    });
  }
};

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
      const config = getConfiguration(input, ctx);

      validateOrThrowFromConfig(input, config);

      return await getS3UploadSignedUrl({
        key: config.key,
        metadata: input.metadata
          ? { name: input.name, ...parse(input.metadata) }
          : undefined,
      });
    }),
});
