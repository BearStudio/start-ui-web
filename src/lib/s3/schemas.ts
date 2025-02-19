import { t } from 'i18next';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export type UploadFileType = z.infer<typeof zUploadFileType>;
export const zUploadFileType = z.enum(['image', 'application/pdf']);

export type FieldMetadata = z.infer<ReturnType<typeof zFieldMetadata>>;
export const zFieldMetadata = () =>
  z.object({
    fileUrl: zu.string.nonEmptyNullish(z.string()),
    lastModifiedDate: z.date().optional(),
    name: zu.string.nonEmptyNullish(z.string()),
    size: zu.string.nonEmptyNullish(z.string()),
    type: zu.string.nonEmptyNullish(z.string()),
  });

export type FieldUploadValue = z.infer<ReturnType<typeof zFieldUploadValue>>;
export const zFieldUploadValue = (acceptedTypes?: UploadFileType[]) =>
  zFieldMetadata()
    .extend({
      file: z.instanceof(File).optional(),
      lastModified: z.number().optional(),
    })
    .refine(
      (file) => {
        if (!acceptedTypes || acceptedTypes.length === 0) {
          return true;
        }

        return acceptedTypes.some((type) => file.type?.startsWith(type));
      },
      {
        message: t('common:files.invalid', {
          acceptedTypes: acceptedTypes?.join(', '),
        }),
      }
    );

export type UploadSignedUrlInput = z.infer<
  ReturnType<typeof zUploadSignedUrlInput>
>;
export const zUploadSignedUrlInput = () =>
  z.object({
    /**
     * Must be a string as trpc-openapi requires that attributes must be serialized
     */
    metadata: z.string().optional(),
    name: z.string(),
    fileType: z.string(),
    size: z.number(),
    collection: z.enum(['avatar']),
  });
export type UploadSignedUrlOutput = z.infer<
  ReturnType<typeof zUploadSignedUrlOutput>
>;
export const zUploadSignedUrlOutput = () =>
  z.object({
    key: z.string(),
    signedUrl: z.string(),
  });
