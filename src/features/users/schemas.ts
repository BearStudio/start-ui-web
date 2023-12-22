import { z } from 'zod';

import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

export const USER_AUTHORIZATIONS = ['APP', 'ADMIN'] as const;
export type UserAuthorization = z.infer<ReturnType<typeof zUserAuthorization>>;
export const zUserAuthorization = () => z.enum(USER_AUTHORIZATIONS);

export type UserAccountStatus = z.infer<ReturnType<typeof zUserAccountStatus>>;
export const zUserAccountStatus = () =>
  z.enum(['DISABLED', 'ENABLED', 'NOT_VERIFIED']).catch('DISABLED');

export type User = z.infer<ReturnType<typeof zUser>>;
export const zUser = () =>
  z.object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    name: z.string().nullish(),
    email: z.string().trim().toLowerCase(),
    authorizations: z.array(zUserAuthorization()).catch(['APP']),
    accountStatus: zUserAccountStatus(),
    language: z.string().default(DEFAULT_LANGUAGE_KEY),
  });
