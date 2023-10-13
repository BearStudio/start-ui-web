import { z } from 'zod';

import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

export type UserAuthorization = ReturnType<typeof zUserAuthorization>;
export const zUserAuthorization = () => z.enum(['APP', 'ADMIN']).catch('APP');

export type UserAccountStatus = ReturnType<typeof zUserAccountStatus>;
export const zUserAccountStatus = () =>
  z.enum(['DISABLED', 'ENABLED', 'NOT_VERIFIED']).catch('DISABLED');

export type User = ReturnType<typeof zUser>;
export const zUser = () =>
  z.object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    name: z.string().nullish(),
    email: z.string().trim().toLowerCase(),
    authorizations: z.array(zUserAuthorization()),
    accountStatus: zUserAccountStatus(),
    language: z.string().default(DEFAULT_LANGUAGE_KEY),
  });
