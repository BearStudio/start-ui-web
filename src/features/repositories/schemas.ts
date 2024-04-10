import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export type Repository = z.infer<ReturnType<typeof zRepository>>;
export const zRepository = () =>
  z.object({
    id: z.string().cuid(),
    name: zu.string.nonEmpty(z.string()),
    link: zu.string
      .nonEmpty(z.string().min(4).includes('.'))
      .transform((v) => (v.startsWith('http') ? v : `https://${v}`)),
    description: z.string().nullish(),
  });

export type FormFieldsRepository = z.infer<
  ReturnType<typeof zFormFieldsRepository>
>;
export const zFormFieldsRepository = () =>
  zRepository().pick({ name: true, link: true, description: true });
