import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { ExtendedTRPCError } from '@/server/config/errors';
import { adminProcedure, createTRPCRouter } from '@/server/config/trpc';

const zRepository = () =>
  z.object({
    id: z.string(),
    name: z.string(),
    link: z.string(),
    description: z.string().nullish(),
  });

export const repositoriesRouter = createTRPCRouter({
  getById: adminProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/repositories/{id}',
        protect: true,
        tags: ['repositories'],
      },
    })
    .input(z.object({ id: z.string().cuid() }))
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

  getAll: adminProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/repositories',
        protect: true,
        tags: ['repositories'],
      },
    })
    .input(
      z.object({
        page: z.number().int().gte(1).default(1),
        size: z.number().int().gte(1).default(20),
      })
    )
    .output(
      z.object({
        items: z.array(zRepository()),
        total: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      ctx.logger.info('Getting repositories using pagination');
      const [items, total] = await Promise.all([
        ctx.db.repository.findMany({
          skip: (input.page - 1) * input.size,
          take: input.size,
          orderBy: {
            name: 'asc',
          },
        }),
        ctx.db.repository.count(),
      ]);

      return {
        items,
        total,
      };
    }),

  create: adminProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/repositories',
        protect: true,
        tags: ['repositories'],
      },
    })
    .input(
      z.object({
        name: z.string(),
        link: z.string(),
        description: z.string().nullish(),
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

  updateById: adminProcedure
    .meta({
      openapi: {
        method: 'PUT',
        path: '/repositories/{id}',
        protect: true,
        tags: ['repositories'],
      },
    })
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string(),
        link: z.string(),
        description: z.string().nullish(),
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

  removeById: adminProcedure
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/repositories/{id}',
        protect: true,
        tags: ['repositories'],
      },
    })
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
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
