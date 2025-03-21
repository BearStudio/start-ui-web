import { t } from 'i18next';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export type FormFieldsLogin = z.infer<ReturnType<typeof zFormFieldsLogin>>;
export const zFormFieldsLogin = () =>
  z.object({
    email: zu.string.email(
      z.string({
        required_error: t('users:data.email.required'),
        invalid_type_error: t('users:data.email.invalid'),
      })
    ),
  });

export type FormFieldsLoginVerify = z.infer<
  ReturnType<typeof zFormFieldsLoginVerify>
>;
export const zFormFieldsLoginVerify = () =>
  z.object({
    otp: z
      .string({
        invalid_type_error: t('auth:data.verificationCode.invalid'),
        required_error: t('auth:data.verificationCode.required'),
      })
      .length(6, t('auth:data.verificationCode.invalid')),
  });
