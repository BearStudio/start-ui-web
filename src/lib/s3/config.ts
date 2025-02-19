import { z } from 'zod';

import { User } from '@/features/users/schemas';

export type FilesCollectionName = z.infer<
  ReturnType<typeof zFilesCollectionName>
>;
export const zFilesCollectionName = () => z.enum(['avatar']);

// TODO Also use this config in form validation
export const FILES_COLLECTIONS_CONFIG = {
  avatar: {
    getKey: ({ user }) => `avatars/${user.id}`,
    allowedTypes: ['image/png', 'image/jpg', 'image/jpeg'],
    maxSize: 1 * 1024 * 1024, // 5MB in bytes,
  },
} satisfies Record<FilesCollectionName, FilesCollectionConfig>;

export type FilesCollectionConfig = {
  getKey: (params: { user: User }) => string;
  allowedTypes?: Array<string>;
  maxSize?: number;
};
