import { createId } from '@paralleldrive/cuid2';
import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const genre = pgTable('genre', {
  id: varchar('id').primaryKey().$defaultFn(createId),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  color: varchar('color', { length: 255 }).notNull(),
});
