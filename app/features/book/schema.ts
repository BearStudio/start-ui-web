import { t } from 'i18next';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

export type Book = z.infer<ReturnType<typeof zBook>>;

export const zBook = () =>
  z.object({
    id: z.string().cuid(),
    title: zu.string.nonEmpty(z.string(), {
      required_error: t('book:fields.title.required'),
    }),
    author: zu.string.nonEmpty(z.string()),
    genre: zu.string.nonEmptyNullish(z.string()),
    publisher: zu.string.nonEmptyNullish(z.string()),
    createdAt: z.date(),
    updatedAt: z.date(),
  });

export type FormFieldsBook = z.infer<ReturnType<typeof zFormFieldsBook>>;
export const zFormFieldsBook = () =>
  zBook().pick({ title: true, author: true, genre: true, publisher: true });
