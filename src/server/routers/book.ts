import { ORPCError } from '@orpc/client';
import { and, asc, eq, gt, like, or } from 'drizzle-orm';
import { z } from 'zod';

import { zBook } from '@/features/book/schema';
import { Prisma } from '@/server/db/generated/client';
import { book } from '@/server/db/schemas';
import { protectedProcedure } from '@/server/orpc';

const tags = ['books'];

export default {
  getAll: protectedProcedure({
    permission: {
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
          limit: z.coerce.number().int().min(1).max(100).default(20),
          searchTerm: z.string().trim().optional().default(''),
        })
        .default({})
    )
    .output(
      z.object({
        items: z.array(zBook()),
        nextCursor: z.string().cuid().optional(),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }) => {
      context.logger.info('Getting books from database');

      const whereSearchTerm = input.searchTerm
        ? or(
            like(book.title, `%${input.searchTerm}%`),
            like(book.author, `%${input.searchTerm}%`)
          )
        : undefined;
      const [total, items] = await context.db.transaction(async (tr) => [
        await tr.$count(book, whereSearchTerm),
        await tr.query.book.findMany({
          where: and(
            input.cursor ? gt(book.id, input.cursor) : undefined,
            whereSearchTerm
          ),
          orderBy: asc(book.title),
          limit: input.limit + 1,
          with: {
            genre: true,
          },
        }),
      ]);

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
    permission: {
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
        id: z.string().cuid(),
      })
    )
    .output(zBook())
    .handler(async ({ context, input }) => {
      context.logger.info('Getting book');
      const item = await context.db.query.book.findFirst({
        where: eq(book.id, input.id),
        with: {
          genre: true,
        },
      });

      if (!item) {
        context.logger.warn('Unable to find book with the provided input');
        throw new ORPCError('NOT_FOUND');
      }

      return item;
    }),

  create: protectedProcedure({
    permission: {
      book: ['create'],
    },
  })
    .route({
      method: 'POST',
      path: '/books',
      tags,
    })
    .input(
      zBook()
        .pick({
          title: true,
          author: true,
          publisher: true,
        })
        .extend({ genreId: z.string().nonempty() })
    )
    .output(zBook())
    .handler(async ({ context, input }) => {
      context.logger.info('Create book');
      const [inserted] = await context.db
        .insert(book)
        .values({
          title: input.title,
          author: input.author,
          genreId: input.genreId ?? undefined,
          publisher: input.publisher,
        })
        .returning();
      if (!inserted) {
        context.logger.error('Unable to get the returning book from insert');
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
      const result = await context.db.query.book.findFirst({
        where: eq(book.id, inserted?.id),
        with: {
          genre: true,
        },
      });
      if (!result) {
        context.logger.error('Unable to find the inserted book');
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
      return result;
    }),

  updateById: protectedProcedure({
    permission: {
      book: ['update'],
    },
  })
    .route({
      method: 'POST',
      path: '/books/{id}',
      tags,
    })
    .input(
      zBook()
        .pick({
          id: true,
          title: true,
          author: true,
          publisher: true,
        })
        .extend({ genreId: z.string().nonempty() })
    )
    .output(zBook())
    .handler(async ({ context, input }) => {
      context.logger.info('Update book');
      try {
        return await context.db.book.update({
          where: { id: input.id },
          data: {
            title: input.title,
            author: input.author,
            genreId: input.genreId,
            publisher: input.publisher ?? null,
          },
        });
      } catch (error: unknown) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ORPCError('CONFLICT', {
            data: {
              target: error.meta?.target,
            },
          });
        }
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

  deleteById: protectedProcedure({
    permission: {
      user: ['delete'],
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
      try {
        await context.db.book.delete({
          where: { id: input.id },
        });
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),
};
