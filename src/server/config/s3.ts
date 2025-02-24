import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { env } from '@/env.mjs';
import { FieldMetadata, UploadSignedUrlOutput } from '@/lib/s3/schemas';

const SIGNED_URL_EXPIRATION_TIME_SECONDS = 60; // 1 minute

const S3 = new S3Client({
  region: 'auto',
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

type UploadSignedUrlOptions = {
  /** The tree structure of the file in S3 */
  key: string;
  metadata?: Record<string, string>;
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
    { expiresIn: SIGNED_URL_EXPIRATION_TIME_SECONDS }
  );

  return {
    signedUrl,
    key: options.key,
  };
};

export const fetchFileMetadata = async (
  key: string
): Promise<{ success: true; data: FieldMetadata } | { success: false }> => {
  const s3key = key.split('?')[0]; // Remove the ?timestamp
  try {
    const command = new HeadObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: s3key,
    });
    const fileResponse = await S3.send(command);

    return {
      success: true,
      data: {
        size: fileResponse.ContentLength,
        type: fileResponse.ContentType,
        lastModifiedDate: fileResponse.LastModified
          ? new Date(fileResponse.LastModified)
          : undefined,
        name: fileResponse.Metadata?.name,
      },
    };
  } catch {
    return {
      success: false,
    };
  }
};
