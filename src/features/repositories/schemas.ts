import { t } from 'i18next';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export type Repository = z.infer<ReturnType<typeof zRepository>>;

export const zRepository = () =>
  z.object({
    id: z.string().cuid(),
    name: zu.string.nonEmpty(z.string(), {
      required_error: t('repositories:data.name.required'),
    }),
    link: zu.string
      .nonEmpty(z.string(), {
        required_error: t('repositories:data.link.required'),
      })
      .pipe(
        z
          .string()
          .min(4, t('repositories:data.link.tooSmall', { min: 4 }))
          .includes('.', { message: t('repositories:data.link.missingDot') })
      )
      .transform((v) => (v.startsWith('http') ? v : `https://${v}`)),
    description: zu.string.nonEmptyNullable(z.string()),
  });

export type FormFieldsRepository = z.infer<
  ReturnType<typeof zFormFieldsRepository>
>;
export const zFormFieldsRepository = () =>
  zRepository().pick({ name: true, link: true, description: true });
