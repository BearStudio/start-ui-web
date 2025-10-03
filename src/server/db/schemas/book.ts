import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

import { dbSchemas } from '@/server/db';

export const book = pgTable('book', {
  id: varchar('id').primaryKey().$defaultFn(createId),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  title: varchar('title', { length: 255 }).unique().notNull(),
  author: varchar('author', { length: 255 }).notNull(),
  publisher: varchar('publisher', { length: 255 }),
  genreId: varchar('genre_id')
    .references(() => dbSchemas.genre.id)
    .notNull(),
});

export const bookRelations = relations(book, ({ one }) => ({
  genre: one(dbSchemas.genre, {
    fields: [book.genreId],
    references: [dbSchemas.genre.id],
  }),
}));
