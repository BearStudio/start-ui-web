import { t } from 'i18next';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export type Otp = z.infer<ReturnType<typeof zOtp>>;
export const zOtp = () =>
  z
    .string({
      error: t('auth:common.otp.required'),
    })
    .length(6, t('auth:common.otp.invalidLength'));

export type FormFieldsLogin = z.infer<ReturnType<typeof zFormFieldsLogin>>;
export const zFormFieldsLogin = () =>
  z.object({
    email: zu.fieldText.required().pipe(
      z.email({
        error: (issue) =>
          issue.input
            ? t('auth:common.email.invalid')
            : t('auth:common.email.required'),
      })
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
    name: zu.fieldText.required(),
  });
