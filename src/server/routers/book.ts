import { ORPCError } from '@orpc/client';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

import { zBook, zFormFieldsBook } from '@/features/book/schema';
import { Prisma } from '@/server/db/generated/client';
import { openai } from '@/server/openai';
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

      const [total, items] = await Promise.all([
        context.db.book.count({
          where,
        }),
        context.db.book.findMany({
          // Get an extra item at the end which we'll use as next cursor
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: {
            title: 'asc',
          },
          where,
          include: { genre: true },
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
        id: z.string(),
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
    .input(zFormFieldsBook())
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
    .input(zFormFieldsBook().extend({ id: z.string() }))
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
      try {
        await context.db.book.delete({
          where: { id: input.id },
        });
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

  autoGenerate: protectedProcedure({
    permission: {
      book: ['create'],
    },
  })
    .route({
      method: 'POST',
      path: '/books/auto-generate',
      tags,
    })
    .input(
      z
        .object({
          title: z.string().nullish(),
          author: z.string().nullish(),
          publisher: z.string().nullish(),
        })
        .extend({ genreId: z.string().nullish() })
        .optional()
    )
    .output(
      zBook()
        .pick({ title: true, author: true, genre: true, publisher: true })
        .extend({ genreId: z.string() })
    )
    .handler(async ({ context, input }) => {
      context.logger.info('Auto generate books');

      const genres = await context.db.genre.findMany({
        select: { id: true, name: true },
      });

      const withSetValues =
        input?.author || input?.title || input?.genreId || input?.publisher;

      const response = await openai.chat.completions.create({
        model: 'gpt-5-nano',
        messages: [
          {
            role: 'system',
            content: [
              'You are a helpful assistant who generates real life existing books data in JSON.',
              `This is the list of genres: ${JSON.stringify(genres)}`,
            ].join('\n'),
          },
          {
            role: 'user',
            content:
              'Generate a new book with a title, author name, genre and publisher as JSON.',
          },
          ...(withSetValues
            ? ([
                {
                  role: 'user',
                  content: `The following values are set: ${JSON.stringify(input)}, Complete the missing ones`,
                },
              ] as const)
            : []),
        ],
        response_format: zodResponseFormat(
          z.object({
            title: z.string(),
            author: z.string(),
            genreId: z.string(),
            publisher: z.string().nullable(),
          }),
          'book'
        ),
      });

      context.logger.info('Response from OpenAI');
      context.logger.info({ response: response.choices[0]?.message.content });

      const generatedBook = zBook()
        .pick({ title: true, author: true, genre: true, publisher: true })
        .extend({ genreId: z.string() })
        .safeParse(JSON.parse(response.choices[0]?.message.content ?? ''));

      if (generatedBook.error) {
        context.logger.error('Invalid auto generated book');
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: generatedBook.error.message,
        });
      }

      return generatedBook.data;
    }),
};
