import { t } from 'i18next';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export type Otp = z.infer<ReturnType<typeof zOtp>>;
export const zOtp = () =>
  z
    .string({
      invalid_type_error: t('auth:common.otp.invalid'),
      required_error: t('auth:common.otp.required'),
    })
    .length(6, t('auth:common.otp.invalidLength'));

export type FormFieldsLogin = z.infer<ReturnType<typeof zFormFieldsLogin>>;
export const zFormFieldsLogin = () =>
  z.object({
    email: zu.string.email(
      z.string({
        required_error: t('auth:common.email.required'),
        invalid_type_error: t('auth:common.email.invalid'),
      }),
      {
        required_error: t('auth:common.email.required'),
        invalid_type_error: t('auth:common.email.invalid'),
      }
    ),
  });

export type FormFieldsLoginVerify = z.infer<
  ReturnType<typeof zFormFieldsLoginVerify>
>;
export const zFormFieldsLoginVerify = () =>
  z.object({
    otp: zOtp(),
  });

export type FormFieldsOnboarding = z.infer<
  ReturnType<typeof zFormFieldsOnboarding>
>;
export const zFormFieldsOnboarding = () =>
  z.object({
    name: zu.string.nonEmpty(z.string()),
  });
