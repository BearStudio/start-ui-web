import { t } from 'i18next';
import { z } from 'zod';

import { getFieldPath } from '@/lib/form/getFieldPath';
import {
  FILES_COLLECTIONS_CONFIG,
  FilesCollectionName,
  zFilesCollectionName,
} from '@/lib/s3/config';
import { validateFile } from '@/lib/s3/utils';
import { zu } from '@/lib/zod/zod-utils';

export type FieldMetadata = z.infer<ReturnType<typeof zFieldMetadata>>;
export const zFieldMetadata = () =>
  z.object({
    fileUrl: zu.string.nonEmptyNullish(z.string()),
    lastModifiedDate: z.date().optional(),
    name: zu.string.nonEmptyNullish(z.string()),
    size: z.coerce.number().nullish(),
    type: zu.string.nonEmptyNullish(z.string()),
  });

export type FieldUploadValue = z.infer<ReturnType<typeof zFieldUploadValue>>;
export const zFieldUploadValue = (collection: FilesCollectionName) =>
  zFieldMetadata()
    .extend({
      file: z.instanceof(File).optional(),
      lastModified: z.number().optional(),
    })
    .superRefine((input, ctx) => {
      const config = FILES_COLLECTIONS_CONFIG[collection];
      const validateFileReturn = validateFile({ input, config });

      if (!validateFileReturn.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t(`files.errors.${validateFileReturn.error.key}`),
        });
      }
    });

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
    type: z.string(),
    size: z.number(),
    collection: zFilesCollectionName(),
  });
export type UploadSignedUrlOutput = z.infer<
  ReturnType<typeof zUploadSignedUrlOutput>
>;
export const zUploadSignedUrlOutput = () =>
  z.object({
    key: z.string(),
    signedUrl: z.string(),
  });
