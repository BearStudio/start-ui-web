import { z } from 'zod';

import { User } from '@/features/users/schemas';

export type FilesCollection = z.infer<ReturnType<typeof zFilesCollection>>;
export const zFilesCollection = () => z.enum(['avatar']);

// TODO Also use this config in form validation
export const FILES_COLLECTIONS_CONFIG = {
  avatar: {
    getKey: ({ user }) => `avatars/${user.id}`,
    fileTypes: ['image/png', 'image/jpg', 'image/jpeg'],
    maxSize: 1 * 1024 * 1024, // 5MB in bytes,
  },
} satisfies Record<
  FilesCollection,
  {
    getKey: (params: { user: User }) => string;
    fileTypes?: Array<string>;
    maxSize?: number;
  }
>;
