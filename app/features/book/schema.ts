import { t } from 'i18next';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import { zGenre } from '@/features/genre/schema';

export type Book = z.infer<ReturnType<typeof zBook>>;

export const zBook = () =>
  z.object({
    id: z.string().cuid(),
    title: zu.string.nonEmpty(z.string(), {
      required_error: t('book:common.title.required'),
    }),
    author: zu.string.nonEmpty(z.string()),
    genre: zGenre().nullish(),
    publisher: zu.string.nonEmptyNullish(z.string()),
    createdAt: z.date(),
    updatedAt: z.date(),
  });

export type FormFieldsBook = z.infer<ReturnType<typeof zFormFieldsBook>>;
export const zFormFieldsBook = () =>
  zBook()
    .pick({ title: true, author: true, publisher: true })
    .extend({ genreId: z.string().nonempty() });
