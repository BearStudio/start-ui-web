import { t } from 'i18next';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import { zRole } from '@/features/auth/permissions';

export type User = z.infer<ReturnType<typeof zUser>>;
export const zUser = () =>
  z.object({
    id: z.string(),
    name: zu.string.nonEmptyNullish(
      z.string({
        required_error: t('user:common.name.required'),
        invalid_type_error: t('user:common.name.invalid'),
      })
    ),
    email: zu.string.email(z.string(), {
      required_error: t('user:common.email.required'),
      invalid_type_error: t('user:common.email.invalid'),
    }),
    emailVerified: z.boolean(),
    role: zRole().nullish(),
    image: z.string().nullish(),
    createdAt: z.date(),
    updatedAt: z.date(),
    onboardedAt: z.date().nullish(),
  });

export type Session = z.infer<ReturnType<typeof zSession>>;
export const zSession = () =>
  z.object({
    id: z.string(),
    token: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    expiresAt: z.date(),
  });

export type FormFieldsUser = z.infer<ReturnType<typeof zFormFieldsUser>>;
export const zFormFieldsUser = () =>
  zUser().pick({
    name: true,
    email: true,
    role: true,
  });
