import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';
import { zOtp } from '@/features/auth/schema';

export type FormFieldsAccountUpdateName = z.infer<
  ReturnType<typeof zFormFieldsAccountUpdateName>
>;
export const zFormFieldsAccountUpdateName = () =>
  z.object({
    name: zu.string.nonEmpty(z.string()),
  });

export type FormFieldsAccountChangeEmailInit = z.infer<
  ReturnType<typeof zFormFieldsAccountChangeEmailInit>
>;
export const zFormFieldsAccountChangeEmailInit = () =>
  z.object({
    email: zu.string.email(z.string()),
  });

export type FormFieldsAccountChangeEmailVerify = z.infer<
  ReturnType<typeof zFormFieldsAccountChangeEmailVerify>
>;
export const zFormFieldsAccountChangeEmailVerify = () =>
  z.object({
    otp: zOtp(),
  });
