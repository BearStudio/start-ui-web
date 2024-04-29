import { t } from 'i18next';
import { z } from 'zod';

import { zUser } from '@/features/users/schemas';

export type FormFieldsLogin = z.infer<ReturnType<typeof zFormFieldsLogin>>;
export const zFormFieldsLogin = () => zUser().pick({ email: true });

export type FormFieldsRegister = z.infer<
  ReturnType<typeof zFormFieldsRegister>
>;
export const zFormFieldsRegister = () =>
  zUser().pick({ email: true, name: true, language: true }).required();

export type FormFieldsVerificationCode = z.infer<
  ReturnType<typeof zFormFieldsVerificationCode>
>;
export const zFormFieldsVerificationCode = () =>
  z.object({
    code: z
      .string({
        invalid_type_error: t('auth:data.verificationCode.invalid'),
        required_error: t('auth:data.verificationCode.required'),
      })
      .min(6, t('auth:data.verificationCode.invalid'))
      .max(6, t('auth:data.verificationCode.invalid')),
  });
