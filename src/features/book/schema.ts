import { t } from 'i18next';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import { zGenre } from '@/features/genre/schema';

export type Book = z.infer<ReturnType<typeof zBook>>;

export const zBook = () =>
  z.object({
    id: z.string(),
    title: zu.fieldText.required({ error: t('book:common.title.required') }),
    author: zu.fieldText.required(),
    genre: zGenre().nullish(),
    publisher: zu.fieldText.nullish(),
    createdAt: z.date(),
    updatedAt: z.date(),
    coverId: z.string().nullish(),
  });

export type FormFieldsBook = z.infer<ReturnType<typeof zFormFieldsBook>>;
export const zFormFieldsBook = () =>
  zBook()
    .pick({ title: true, author: true, publisher: true, coverId: true })
    .extend({ genreId: zu.fieldText.required() });

export const bookCoverAcceptedFileTypes = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
];
