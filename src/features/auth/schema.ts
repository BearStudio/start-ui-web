import { t } from 'i18next';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export type Otp = z.infer<ReturnType<typeof zOtp>>;
export const zOtp = () =>
  z
    .string({
      error: (issue) =>
        !issue.input
          ? t('auth:common.otp.required')
          : t('auth:common.otp.invalid'),
    })
    .length(6, t('auth:common.otp.invalidLength'));

export type FormFieldsLogin = z.infer<ReturnType<typeof zFormFieldsLogin>>;
export const zFormFieldsLogin = () =>
  z.object({
    email: zu.fieldText.required().pipe(
      z.email({
        error: (issue) =>
          !issue.input
            ? t('auth:common.email.required')
            : t('auth:common.email.invalid'),
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
    name: z.string().nonempty(),
  });
