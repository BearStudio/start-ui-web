import { z } from 'zod';

import { zu } from '@/platform/lib/zod/zod-utils';

export type Otp = z.infer<ReturnType<typeof zOtp>>;
export const zOtp = () =>
  z
    .string({
      error: 'auth:common.otp.required',
    })
    .length(6, 'auth:common.otp.invalidLength');

export type FormFieldsLogin = z.infer<ReturnType<typeof zFormFieldsLogin>>;
export const zFormFieldsLogin = () =>
  z.object({
    email: zu.fieldText.required({ error: 'auth:common.email.required' }).pipe(
      z.email({
        error: (issue) =>
          issue.input
            ? 'auth:common.email.invalid'
            : 'auth:common.email.required',
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
