import { ORPCError } from '@orpc/client';
import { and, asc, eq, gt, ilike, or, sql } from 'drizzle-orm';
import { z } from 'zod';

import { zBook, zFormFieldsBook } from '@/features/book/schema';
import { book } from '@/server/db/schema';
import { protectedProcedure } from '@/server/orpc';

const tags = ['books'];

export default {
  getAll: protectedProcedure({
    permissions: {
      book: ['read'],
    },
  })
    .route({
      method: 'GET',
      path: '/books',
      tags,
    })
    .input(
      z
        .object({
          cursor: z.string().optional(),
          limit: z.coerce.number().int().min(1).max(100).prefault(20),
          searchTerm: z.string().trim().optional().prefault(''),
        })
        .prefault({})
    )
    .output(
      z.object({
        items: z.array(zBook()),
        nextCursor: z.string().optional(),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }) => {
      context.logger.info('Getting books from database');

      const searchPattern = `%${input.searchTerm}%`;
      const searchFilter = input.searchTerm
        ? or(
            ilike(book.title, searchPattern),
            ilike(book.author, searchPattern)
          )
        : undefined;

      const cursorRow = input.cursor
        ? await context.db.query.book.findFirst({
            where: eq(book.id, input.cursor),
            columns: { id: true, title: true },
          })
        : undefined;

      if (input.cursor && !cursorRow) {
        const [totalResult] = await context.db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(book)
          .where(searchFilter);

        return {
          items: [],
          nextCursor: undefined,
          total: totalResult?.count ?? 0,
        };
      }

      const cursorFilter = cursorRow
        ? or(
            gt(book.title, cursorRow.title),
            and(eq(book.title, cursorRow.title), gt(book.id, cursorRow.id))
          )
        : undefined;

      const where = and(searchFilter, cursorFilter);

      const [totalResult, items] = await Promise.all([
        context.db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(book)
          .where(searchFilter),
        context.db.query.book.findMany({
          where: where,
          orderBy: [asc(book.title), asc(book.id)],
          limit: input.limit + 1,
          with: { genre: true },
        }),
      ]);

      const total = totalResult[0]?.count ?? 0;

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
        total,
      };
    }),

  getById: protectedProcedure({
    permissions: {
      book: ['read'],
    },
  })
    .route({
      method: 'GET',
      path: '/books/{id}',
      tags,
    })
    .input(
      z.object({
        id: z.string(),
      })
    )
    .output(zBook())
    .handler(async ({ context, input }) => {
      context.logger.info('Getting book');
      const result = await context.db.query.book.findFirst({
        where: eq(book.id, input.id),
        with: { genre: true },
      });

      if (!result) {
        context.logger.warn('Unable to find book with the provided input');
        throw new ORPCError('NOT_FOUND');
      }

      return result;
    }),

  create: protectedProcedure({
    permissions: {
      book: ['create'],
    },
  })
    .route({
      method: 'POST',
      path: '/books',
      tags,
    })
    .input(zFormFieldsBook())
    .output(zBook())
    .handler(async ({ context, input }) => {
      context.logger.info('Create book');
      const [created] = await context.db
        .insert(book)
        .values({
          title: input.title,
          author: input.author,
          genreId: input.genreId,
          publisher: input.publisher,
          coverId: input.coverId,
        })
        .returning();

      if (!created) {
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }

      return created;
    }),

  updateById: protectedProcedure({
    permissions: {
      book: ['update'],
    },
  })
    .route({
      method: 'POST',
      path: '/books/{id}',
      tags,
    })
    .input(zFormFieldsBook().extend({ id: z.string() }))
    .output(zBook())
    .handler(async ({ context, input }) => {
      context.logger.info('Update book');
      const [updated] = await context.db
        .update(book)
        .set({
          title: input.title,
          author: input.author,
          genreId: input.genreId,
          publisher: input.publisher ?? null,
          coverId: input.coverId ?? null,
        })
        .where(eq(book.id, input.id))
        .returning();

      if (!updated) {
        throw new ORPCError('NOT_FOUND');
      }

      return updated;
    }),

  deleteById: protectedProcedure({
    permissions: {
      book: ['delete'],
    },
  })
    .route({
      method: 'DELETE',
      path: '/books/{id}',
      tags,
    })
    .input(
      zBook().pick({
        id: true,
      })
    )
    .output(z.void())
    .handler(async ({ context, input }) => {
      context.logger.info('Delete book');
      const [deleted] = await context.db
        .delete(book)
        .where(eq(book.id, input.id))
        .returning({ id: book.id });

      if (!deleted) {
        throw new ORPCError('NOT_FOUND');
      }
    }),
};
