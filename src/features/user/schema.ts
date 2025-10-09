import { t } from 'i18next';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import { zRole } from '@/features/auth/permissions';

export type User = z.infer<ReturnType<typeof zUser>>;
export const zUser = () =>
  z.object({
    id: z.string(),
    name: zu.fieldText.nullish(),
    email: zu.fieldText.required().pipe(
      z.email({
        error: (issue) =>
          issue.input
            ? t('user:common.email.invalid')
            : t('user:common.email.required'),
      })
    ),
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
