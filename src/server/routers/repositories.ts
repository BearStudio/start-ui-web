import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { zRepository } from '@/features/repositories/schemas';
import { ExtendedTRPCError } from '@/server/config/errors';
import { createTRPCRouter, protectedProcedure } from '@/server/config/trpc';

export const repositoriesRouter = createTRPCRouter({
  getById: protectedProcedure({ authorizations: ['APP', 'ADMIN'] })
    .meta({
      openapi: {
        method: 'GET',
        path: '/repositories/{id}',
        protect: true,
        tags: ['repositories'],
      },
    })
    .input(zRepository().pick({ id: true }))
    .output(zRepository())
    .query(async ({ ctx, input }) => {
      ctx.logger.info('Getting repository');
      const repository = await ctx.db.repository.findUnique({
        where: { id: input.id },
      });

      if (!repository) {
        ctx.logger.warn('Unable to find repository with the provided input');
        throw new TRPCError({
          code: 'NOT_FOUND',
        });
      }

      return repository;
    }),

  getAll: protectedProcedure({ authorizations: ['APP', 'ADMIN'] })
    .meta({
      openapi: {
        method: 'GET',
        path: '/repositories',
        protect: true,
        tags: ['repositories'],
      },
    })
    .input(
      z
        .object({
          cursor: z.string().cuid().optional(),
          limit: z.number().min(1).max(100).default(20),
          searchTerm: z.string().optional(),
        })
        .default({})
    )
    .output(
      z.object({
        items: z.array(zRepository()),
        nextCursor: z.string().cuid().optional(),
        total: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      ctx.logger.info('Getting repositories from database');

      const where = {
        name: {
          contains: input.searchTerm,
          mode: 'insensitive',
        },
      } satisfies Prisma.RepositoryWhereInput;

      const [total, items] = await ctx.db.$transaction([
        ctx.db.repository.count({
          where,
        }),
        ctx.db.repository.findMany({
          // Get an extra item at the end which we'll use as next cursor
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: {
            name: 'asc',
          },
          where,
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

  create: protectedProcedure({ authorizations: ['ADMIN'] })
    .meta({
      openapi: {
        method: 'POST',
        path: '/repositories',
        protect: true,
        tags: ['repositories'],
      },
    })
    .input(
      zRepository().pick({
        name: true,
        link: true,
        description: true,
      })
    )
    .output(zRepository())
    .mutation(async ({ ctx, input }) => {
      try {
        ctx.logger.info('Creating repository');
        return await ctx.db.repository.create({
          data: input,
        });
      } catch (e) {
        throw new ExtendedTRPCError({
          cause: e,
        });
      }
    }),

  updateById: protectedProcedure({ authorizations: ['ADMIN'] })
    .meta({
      openapi: {
        method: 'PUT',
        path: '/repositories/{id}',
        protect: true,
        tags: ['repositories'],
      },
    })
    .input(
      zRepository().pick({
        id: true,
        name: true,
        link: true,
        description: true,
      })
    )
    .output(zRepository())
    .mutation(async ({ ctx, input }) => {
      try {
        ctx.logger.info('Updating repository');
        return await ctx.db.repository.update({
          where: { id: input.id },
          data: input,
        });
      } catch (e) {
        throw new ExtendedTRPCError({
          cause: e,
        });
      }
    }),

  removeById: protectedProcedure({ authorizations: ['ADMIN'] })
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/repositories/{id}',
        protect: true,
        tags: ['repositories'],
      },
    })
    .input(zRepository().pick({ id: true }))
    .output(zRepository())
    .mutation(async ({ ctx, input }) => {
      ctx.logger.info({ input }, 'Removing repository');
      try {
        return await ctx.db.repository.delete({
          where: { id: input.id },
        });
      } catch (e) {
        throw new ExtendedTRPCError({
          cause: e,
        });
      }
    }),
});
