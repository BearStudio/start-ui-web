import { t } from 'i18next';
import { z } from 'zod';

import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';
import { zu } from '@/lib/zod/zod-utils';

export const USER_AUTHORIZATIONS = ['APP', 'ADMIN'] as const;
export type UserAuthorization = z.infer<ReturnType<typeof zUserAuthorization>>;
export const zUserAuthorization = () => z.enum(USER_AUTHORIZATIONS);

export type UserAccountStatus = z.infer<ReturnType<typeof zUserAccountStatus>>;
export const zUserAccountStatus = () =>
  z.enum(['DISABLED', 'ENABLED', 'NOT_VERIFIED']).catch('DISABLED');

export type User = z.infer<ReturnType<typeof zUser>>;
export const zUser = () =>
  z.object({
    id: z.string().cuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
    name: zu.string
      .nonEmpty(
        z.string({
          required_error: t('users:data.name.required'),
          invalid_type_error: t('users:data.name.invalid'),
        }),
        {
          required_error: t('users:data.name.required'),
        }
      )
      .nullish(),
    email: zu.string.email(z.string(), {
      required_error: t('users:data.email.required'),
      invalid_type_error: t('users:data.email.invalid'),
    }),
    image: z.string().url().nullish(),
    authorizations: zu.array
      .nonEmpty(
        z.array(zUserAuthorization(), {
          required_error: t('users:data.authorizations.required'),
        })
      )
      .default(['APP']),
    accountStatus: zUserAccountStatus(),
    language: zu.string
      .nonEmpty(z.string().min(2))
      .default(DEFAULT_LANGUAGE_KEY),
  });

export type FormFieldUser = z.infer<ReturnType<typeof zFormFieldsUser>>;
export const zFormFieldsUser = () =>
  zUser()
    .pick({
      name: true,
      email: true,
      language: true,
      authorizations: true,
    })
    .required();
