import { z } from 'zod';

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
