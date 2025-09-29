import { ORPCError } from '@orpc/client';
import { and, asc, count, gt, like, or } from 'drizzle-orm';
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
          cursor: z.string().cuid().optional(),
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

      const where = or(
        like(book.title, `%${input.searchTerm}%`),
        like(book.author, `%${input.searchTerm}%`)
      );
      const [total, items] = await context.db.transaction(async (tr) => [
        await tr.$count(book, where),
        await tr.query.book.findMany({
          where: and(
            input.cursor ? gt(book.id, input.cursor) : undefined,
            where
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
      const book = await context.db.book.findUnique({
        where: { id: input.id },
        include: { genre: true },
      });

      if (!book) {
        context.logger.warn('Unable to find book with the provided input');
        throw new ORPCError('NOT_FOUND');
      }

      return book;
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
      try {
        return await context.db.book.create({
          data: {
            title: input.title,
            author: input.author,
            genreId: input.genreId ?? undefined,
            publisher: input.publisher,
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
