import { pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';

import {
  createdAtColumn,
  idColumn,
  updatedAtColumn,
} from '@/modules/kernel/infrastructure/db/schema/common';

export const genre = pgTable(
  'genre',
  {
    id: idColumn(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
    name: text('name').notNull(),
    color: text('color').notNull(),
  },
  (table) => [uniqueIndex('genre_name_key').on(table.name)]
);
