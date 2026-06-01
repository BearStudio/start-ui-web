import { z } from 'zod';

import { zu } from '@/platform/lib/zod/zod-utils';

import { zGenre } from '@/modules/genre/presentation';
import { zBookCoverObjectKey, zBookId } from '@/modules/kernel/domain/ids';

export type Book = z.infer<ReturnType<typeof zBook>>;

export const zBook = () =>
  z.object({
    id: zBookId(),
    title: zu.fieldText.required({ error: 'book:common.title.required' }),
    author: zu.fieldText.required(),
    genre: zGenre().nullish(),
    publisher: zu.fieldText.nullish(),
    createdAt: z.date(),
    updatedAt: z.date(),
    coverId: zBookCoverObjectKey().nullish(),
  });

export type FormFieldsBook = z.infer<ReturnType<typeof zFormFieldsBook>>;
export const zFormFieldsBook = () =>
  z.object({
    title: zu.fieldText.required({ error: 'book:common.title.required' }),
    author: zu.fieldText.required(),
    genreId: zu.fieldText.required(),
    publisher: zu.fieldText.nullish(),
    coverId: z.string().nullish(),
  });
