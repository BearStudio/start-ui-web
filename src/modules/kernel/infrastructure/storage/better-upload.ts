import { custom } from '@better-upload/server/clients';

import { env } from '@/modules/kernel/infrastructure/config/env';

export function createUploadClient() {
  return custom({
    host: env.S3_HOST,
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    region: env.S3_REGION,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
    secure: env.S3_SECURE,
  });
}

export type UploadClient = ReturnType<typeof createUploadClient>;

let defaultUploadClient: UploadClient | undefined;

export function getDefaultUploadClient() {
  defaultUploadClient ??= createUploadClient();
  return defaultUploadClient;
}

export const uploadClient = new Proxy({} as UploadClient, {
  get(_target, prop) {
    const client = getDefaultUploadClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
