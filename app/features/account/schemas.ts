import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export type FormFieldsAccountUpdateName = z.infer<
  ReturnType<typeof zFormFieldsAccountUpdateName>
>;
export const zFormFieldsAccountUpdateName = () =>
  z.object({
    name: zu.string.nonEmpty(z.string()),
  });

export type FormFieldsAccountChangeEmail = z.infer<
  ReturnType<typeof zFormFieldsAccountChangeEmail>
>;
export const zFormFieldsAccountChangeEmail = () =>
  z.object({
    email: zu.string.email(z.string()),
  });
