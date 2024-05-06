import { z } from 'zod';

export type FetchedFile = z.infer<ReturnType<typeof zFetchedFile>>;
export const zFetchedFile = () =>
  z.object({
    fileUrl: z.string(),
    size: z.string().optional(),
    type: z.string().optional(),
    lastModifiedDate: z.date(),
  });

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

export type ReadSignedUrlOutput = z.infer<
  ReturnType<typeof zReadSignedUrlOutput>
>;
export const zReadSignedUrlOutput = () =>
  z.object({
    key: z.string(),
    signedUrl: z.string(),
  });
