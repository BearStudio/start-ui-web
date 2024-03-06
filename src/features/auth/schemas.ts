import { z } from 'zod';

import { zUser } from '@/features/users/schemas';

export type FormFieldsLogin = z.infer<ReturnType<typeof zFormFieldsLogin>>;
export const zFormFieldsLogin = () => zUser().pick({ email: true });

export type FormFieldsRegister = z.infer<
  ReturnType<typeof zFormFieldsRegister>
>;
export const zFormFieldsRegister = () =>
  zUser().pick({ email: true, name: true, language: true });

export type FormFieldsVerificationCode = z.infer<
  ReturnType<typeof zFormFieldsVerificationCode>
>;
export const zFormFieldsVerificationCode = () =>
  z.object({ code: z.string().min(6).max(6) });
