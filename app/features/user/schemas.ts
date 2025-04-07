import { t } from 'i18next';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export type User = z.infer<ReturnType<typeof zUser>>;
export const zUser = () =>
  z.object({
    id: z.string(),
    name: z.string({
      required_error: t('user:fields.name.required'),
      invalid_type_error: t('user:fields.name.invalid'),
    }),
    email: zu.string.email(z.string(), {
      required_error: t('user:fields.email.required'),
      invalid_type_error: t('user:fields.email.invalid'),
    }),
    emailVerified: z.boolean(),
    image: z.string().nullish(),
    createdAt: z.date(),
    updatedAt: z.date(),
  });
