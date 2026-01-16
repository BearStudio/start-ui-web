import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';

import { zBook } from '@/features/book/schema';
import { db } from '@/server/db';

export const getBooksServer = toolDefinition({
  name: 'get_books',
  description: 'Get the books from the database',
  outputSchema: z.array(zBook()),
}).server(async () => {
  return await db.book.findMany({ include: { genre: true } });
});
