import { t } from 'i18next';
import { z } from 'zod';

import { zUser } from '@/features/users/schemas';
import { zFieldUploadValue } from '@/files/schemas';
import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';
import { zu } from '@/lib/zod/zod-utils';

export type UserAccount = z.infer<ReturnType<typeof zUserAccount>>;
export const zUserAccount = () =>
  zUser().pick({
    id: true,
    name: true,
    email: true,
    image: true,
    authorizations: true,
    language: true,
  });

export type FormFieldsAccountEmail = z.infer<
  ReturnType<typeof zFormFieldsAccountEmail>
>;
export const zFormFieldsAccountEmail = () => zUser().pick({ email: true });

export type FormFieldsAccountProfile = z.infer<
  ReturnType<typeof zFormFieldsAccountProfile>
>;

// TODO : Clean
export const zFormFieldsAccountProfile = () =>
  z.object({
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
    language: zu.string
      .nonEmpty(z.string().min(2))
      .default(DEFAULT_LANGUAGE_KEY),
    image: zFieldUploadValue().optional(),
  });
