import { env } from '@/env.mjs';

export const isFileUrlValidBucket = async (url: string) => {
  return url.startsWith(env.S3_BUCKET_PUBLIC_URL);
};
