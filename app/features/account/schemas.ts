import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export type FormFieldsAccountUpdateEmail = z.infer<
  ReturnType<typeof zFormFieldsAccountUpdateEmail>
>;
export const zFormFieldsAccountUpdateEmail = () =>
  z.object({
    email: zu.string.email(z.string()),
  });
