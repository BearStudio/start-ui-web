import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { env } from '@/env.mjs';
import { ReadSignedUrlOutput, UploadSignedUrlOutput } from '@/lib/s3';

const S3 = new S3Client({
  region: 'auto',
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

type UploadFileType = 'image' | 'video' | 'audio' | 'blob' | 'pdf' | 'text';

type UploadSignedUrlOptions = {
  allowedFileTypes?: UploadFileType[];
  expiresIn?: number;
  /** The tree structure of the file in S3 */
  key: string;
  host?: string;
  metadata?: Record<string, string>;
};

type ReadSignedUrlOptions = {
  expiresIn?: number;
  /** The tree structure of the file in S3 */
  key: string;
};

export const getS3UploadSignedUrl = async (
  options: UploadSignedUrlOptions
): Promise<UploadSignedUrlOutput> => {
  const signedUrl = await getSignedUrl(
    S3,
    new PutObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: options.key,
      Metadata: options.metadata,
    }),
    { expiresIn: options.expiresIn ?? 3600 }
  );

  return {
    signedUrl,
    key: options.key,
    futureFileUrl: (options.host ? `${options.host}/` : '') + options.key,
  };
};

export const getS3ReadSignedUrl = async (
  options: ReadSignedUrlOptions
): Promise<ReadSignedUrlOutput> => {
  const signedUrl = await getSignedUrl(
    S3,
    new GetObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: options.key,
    }),
    { expiresIn: options.expiresIn ?? 3600 }
  );

  return {
    signedUrl,
    key: options.key,
  };
};
