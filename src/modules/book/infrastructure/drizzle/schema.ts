import { index, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';

import { genre } from '@/modules/genre/infrastructure/drizzle/schema';
import {
  createdAtColumn,
  idColumn,
  updatedAtColumn,
} from '@/modules/kernel/infrastructure/db/schema/common';

export const book = pgTable(
  'book',
  {
    id: idColumn(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
    title: text('title').notNull(),
    author: text('author').notNull(),
    genreId: text('genreId')
      .notNull()
      .references(() => genre.id),
    publisher: text('publisher'),
    coverId: text('coverId'),
  },
  (table) => [
    uniqueIndex('book_title_author_key').on(table.title, table.author),
    index('book_genre_id_idx').on(table.genreId),
  ]
);

export const author = pgTable(
  'author',
  {
    id: idColumn(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
    name: text('name').notNull(),
  },
  (table) => [uniqueIndex('author_name_key').on(table.name)]
);

export const publisher = pgTable(
  'publisher',
  {
    id: idColumn(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
    name: text('name').notNull(),
  },
  (table) => [uniqueIndex('publisher_name_key').on(table.name)]
);
