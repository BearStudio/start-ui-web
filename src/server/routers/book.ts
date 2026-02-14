import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import { zBook, zFormFieldsBook } from '@/features/book/schema';
import { tryQuery } from '@/server/db';
import { Prisma } from '@/server/db/generated/client';
import { protectedProcedure, throwPrismaError } from '@/server/orpc';

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

      const where = {
        OR: [
          {
            title: {
              contains: input.searchTerm,
              mode: 'insensitive',
            },
          },
          {
            author: {
              contains: input.searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      } satisfies Prisma.BookWhereInput;

      const [totalResult, itemsResult] = await Promise.all([
        tryQuery(
          context.db.book.count({
            where,
          })
        ),
        tryQuery(
          context.db.book.findMany({
            // Get an extra item at the end which we'll use as next cursor
            take: input.limit + 1,
            cursor: input.cursor ? { id: input.cursor } : undefined,
            orderBy: {
              title: 'asc',
            },
            where,
            include: { genre: true },
          })
        ),
      ]);

      if (totalResult.isErr()) throwPrismaError(totalResult.error);
      if (itemsResult.isErr()) throwPrismaError(itemsResult.error);

      const total = totalResult.value;
      const items = itemsResult.value;

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
        id: z.string(),
      })
    )
    .output(zBook())
    .handler(async ({ context, input }) => {
      context.logger.info('Getting book');
      const result = await tryQuery(
        context.db.book.findUnique({
          where: { id: input.id },
          include: { genre: true },
        })
      );
      if (result.isErr()) throwPrismaError(result.error);

      if (!result.value) {
        context.logger.warn('Unable to find book with the provided input');
        throw new ORPCError('NOT_FOUND');
      }

      return result.value;
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
    .input(zFormFieldsBook())
    .output(zBook())
    .handler(async ({ context, input }) => {
      context.logger.info('Create book');
      const result = await tryQuery(
        context.db.book.create({
          data: {
            title: input.title,
            author: input.author,
            genreId: input.genreId ?? undefined,
            publisher: input.publisher,
            coverId: input.coverId,
          },
        })
      );
      if (result.isErr()) throwPrismaError(result.error);
      return result.value;
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
    .input(zFormFieldsBook().extend({ id: z.string() }))
    .output(zBook())
    .handler(async ({ context, input }) => {
      context.logger.info('Update book');
      const result = await tryQuery(
        context.db.book.update({
          where: { id: input.id },
          data: {
            title: input.title,
            author: input.author,
            genreId: input.genreId,
            publisher: input.publisher ?? null,
            coverId: input.coverId ?? null,
          },
        })
      );
      if (result.isErr()) throwPrismaError(result.error);
      return result.value;
    }),

  deleteById: protectedProcedure({
    permission: {
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
      const result = await tryQuery(
        context.db.book.delete({
          where: { id: input.id },
        })
      );
      if (result.isErr()) throwPrismaError(result.error);
    }),
};
