import { ORPCError } from '@orpc/client';
import { mcp } from '@orpc/mcp';
import { openapi } from '@orpc/openapi';
import { z } from 'zod';

import { zBook, zFormFieldsBook } from '@/features/book/schema';
import { Prisma } from '@/server/db/generated/client';
import { protectedProcedure } from '@/server/orpc';

const tags = ['books'];

export default {
  getAll: protectedProcedure({
    permissions: {
      book: ['read'],
    },
  })
    .meta(
      openapi({
        method: 'GET',
        path: '/books',
        tags,
        summary: 'List books',
        description:
          'List books, 20 per page by default. Filter with `searchTerm` (matches title or author). Use the returned `nextCursor` as `cursor` to get the next page.',
      })
    )
    // Expose as a tool of the MCP server (/api/mcp)
    .meta(mcp.tool({}))
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
    permissions: {
      book: ['read'],
    },
  })
    .meta(
      openapi({
        method: 'GET',
        path: '/books/{id}',
        tags,
        summary: 'Get a book',
        description: 'Get a book by its id, with its genre.',
      })
    )
    // Expose as a tool of the MCP server (/api/mcp)
    .meta(mcp.tool({}))
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
    permissions: {
      book: ['create'],
    },
  })
    .meta(
      openapi({
        method: 'POST',
        path: '/books',
        tags,
        summary: 'Create a book',
        description:
          'Create a book. `genreId` must be the id of a genre returned by `genre_getAll`. Titles are unique.',
      })
    )
    // Expose as a tool of the MCP server (/api/mcp)
    .meta(mcp.tool({}))
    .input(zFormFieldsBook())
    .output(zBook())
    .handler(async ({ context, input }) => {
      context.logger.info('Create book');
      return await context.db.book.create({
        data: {
          title: input.title,
          author: input.author,
          genreId: input.genreId ?? undefined,
          publisher: input.publisher,
          coverId: input.coverId,
        },
      });
    }),

  updateById: protectedProcedure({
    permissions: {
      book: ['update'],
    },
  })
    .meta(
      openapi({
        method: 'POST',
        path: '/books/{id}',
        tags,
        summary: 'Update a book',
        description:
          'Update a book by its id. All fields are replaced: send the current values for the fields you do not want to change.',
      })
    )
    // Expose as a tool of the MCP server (/api/mcp)
    .meta(mcp.tool({}))
    .input(zFormFieldsBook().extend({ id: z.string() }))
    .output(zBook())
    .handler(async ({ context, input }) => {
      context.logger.info('Update book');
      return await context.db.book.update({
        where: { id: input.id },
        data: {
          title: input.title,
          author: input.author,
          genreId: input.genreId,
          publisher: input.publisher ?? null,
          coverId: input.coverId ?? null,
        },
      });
    }),

  deleteById: protectedProcedure({
    permissions: {
      book: ['delete'],
    },
  })
    .meta(
      openapi({
        method: 'DELETE',
        path: '/books/{id}',
        tags,
        summary: 'Delete a book',
        description: 'Delete a book by its id. This cannot be undone.',
      })
    )
    // Expose as a tool of the MCP server (/api/mcp)
    .meta(mcp.tool({ annotations: { destructiveHint: true } }))
    .input(
      zBook().pick({
        id: true,
      })
    )
    .output(z.void())
    .handler(async ({ context, input }) => {
      context.logger.info('Delete book');
      await context.db.book.delete({
        where: { id: input.id },
      });
    }),
};
