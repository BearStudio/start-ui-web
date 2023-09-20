import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { prismaThrowFormatedTRPCError } from '@/server/db';

const zRepository = () =>
  z.object({
    id: z.string(), // @id @default(cuid())
    name: z.string(), // @unique
    link: z.string(),
    description: z.string().nullish(),
  });

export const repositoriesRouter = createTRPCRouter({
  getById: protectedProcedure
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
      const repository = await ctx.db.repository.findUnique({
        where: { id: input.id },
      });

      if (!repository) {
        throw new TRPCError({
          code: 'NOT_FOUND',
        });
      }

      return repository;
    }),

  getAll: protectedProcedure
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

  create: protectedProcedure
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
        return await ctx.db.repository.create({
          data: input,
        });
      } catch (e) {
        prismaThrowFormatedTRPCError(e);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),

  updateById: protectedProcedure
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
        return await ctx.db.repository.update({
          where: { id: input.id },
          data: input,
        });
      } catch (e) {
        prismaThrowFormatedTRPCError(e);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),

  removeById: protectedProcedure
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
      return await ctx.db.repository.delete({
        where: { id: input.id },
      });
    }),
});
