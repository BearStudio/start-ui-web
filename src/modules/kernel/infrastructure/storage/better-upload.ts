import { custom } from '@better-upload/server/clients';

import { getStorageConfig } from '@/modules/kernel/infrastructure/config/storage';

export function createUploadClient() {
  const storageConfig = getStorageConfig();

  return custom({
    host: storageConfig.host,
    accessKeyId: storageConfig.accessKeyId,
    secretAccessKey: storageConfig.secretAccessKey,
    region: storageConfig.region,
    forcePathStyle: storageConfig.forcePathStyle,
    secure: storageConfig.secure,
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
