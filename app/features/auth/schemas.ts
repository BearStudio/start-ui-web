import { t } from 'i18next';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export type FormFieldsLogin = z.infer<ReturnType<typeof zFormFieldsLogin>>;
export const zFormFieldsLogin = () =>
  z.object({
    email: zu.string.email(
      z.string({
        required_error: t('auth:fields.email.required'),
        invalid_type_error: t('auth:fields.email.invalid'),
      }),
      {
        required_error: t('auth:fields.email.required'),
        invalid_type_error: t('auth:fields.email.invalid'),
      }
    ),
  });

export type FormFieldsLoginVerify = z.infer<
  ReturnType<typeof zFormFieldsLoginVerify>
>;
export const zFormFieldsLoginVerify = () =>
  z.object({
    otp: z
      .string({
        invalid_type_error: t('auth:fields.otp.invalid'),
        required_error: t('auth:fields.otp.required'),
      })
      .length(6, t('auth:fields.otp.invalidLength')),
  });

export type FormFieldsOnboarding = z.infer<
  ReturnType<typeof zFormFieldsOnboarding>
>;
export const zFormFieldsOnboarding = () =>
  z.object({
    name: zu.string.nonEmpty(z.string()),
  });
