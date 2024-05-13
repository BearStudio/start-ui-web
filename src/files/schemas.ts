import { t } from 'i18next';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export type UploadFileType = z.infer<typeof zUploadFileType>;
export const zUploadFileType = z.enum([
  'image',
  'video',
  'audio',
  'blob',
  'pdf',
  'text',
]);

export type FieldUploadValue = z.infer<ReturnType<typeof zFieldUploadValue>>;
export const zFieldUploadValue = (acceptedTypes?: UploadFileType[]) =>
  z
    .object({
      fileUrl: zu.string.nonEmptyOptional(z.string()),
      file: z.instanceof(File).optional(),
      lastModified: z.number().optional(),
      lastModifiedDate: z.date().optional(),
      name: zu.string.nonEmptyOptional(z.string()),
      size: zu.string.nonEmptyOptional(z.string()),
      type: zu.string.nonEmptyOptional(z.string()),
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
  z
    .object({
      metadata: z.record(z.string()).nullish(),
    })
    .nullish();

export type UploadSignedUrlOutput = z.infer<
  ReturnType<typeof zUploadSignedUrlOutput>
>;
export const zUploadSignedUrlOutput = () =>
  z.object({
    futureFileUrl: z.string(),
    key: z.string(),
    signedUrl: z.string(),
  });
