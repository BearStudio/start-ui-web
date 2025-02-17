import { env } from '@/env.mjs';

/**
 * Check if the provided string starts with the bucket public URL
 * @param url The URL to check
 * @returns true if the provided `url` matches the bucket public URL
 */
export const doesFileUrlMatchesBucket = async (url: string) => {
  return url.startsWith(env.S3_BUCKET_PUBLIC_URL);
};
