import { createId } from '@paralleldrive/cuid2';
import { text, timestamp } from 'drizzle-orm/pg-core';

export const idColumn = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => createId());

export const createdAtColumn = () =>
  timestamp('createdAt', { precision: 3, mode: 'date' }).defaultNow().notNull();

export const updatedAtColumn = () =>
  timestamp('updatedAt', { precision: 3, mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull();
