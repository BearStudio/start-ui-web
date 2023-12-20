import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

import { env } from '@/env.mjs';

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
  acl: ObjectCannedACL;
  /** The tree structure of the file in S3 */
  key: string;
};

export const getS3UploadSignedUrl = async (options: UploadSignedUrlOptions) => {
  const signedUrl = await getSignedUrl(
    S3,
    new PutObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: options.key,
      ACL: options.acl,
    }),
    { expiresIn: options.expiresIn ?? 3600 }
  );
  return {
    signedUrl,
    key: options.key,
  };
};
