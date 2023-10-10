import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { ExtendedTRPCError } from '@/server/config/errors';
import { createTRPCRouter, protectedProcedure } from '@/server/config/trpc';
import { zUserRole } from '@/server/routers/users';

const zUserAccount = () =>
  z.object({
    id: z.string(),
    name: z.string().nullish(),
    email: z.string(),
    role: zUserRole(),
    language: z.string(),
  });

export const accountRouter = createTRPCRouter({
  get: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/accounts/me',
        protect: true,
        tags: ['accounts'],
      },
    })
    .input(z.void())
    .output(zUserAccount())
    .query(async ({ ctx }) => {
      ctx.logger.debug('Getting user');
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          language: true,
        },
      });

      if (!user) {
        ctx.logger.warn('User not found');
        throw new TRPCError({
          code: 'NOT_FOUND',
        });
      }

      return user;
    }),

  update: protectedProcedure
    .meta({
      openapi: {
        method: 'PUT',
        path: '/accounts/me',
        protect: true,
        tags: ['accounts'],
      },
    })
    .input(
      z.object({
        name: z.string(),
        language: z.string(),
      })
    )
    .output(zUserAccount())
    .mutation(async ({ ctx, input }) => {
      try {
        ctx.logger.debug('Updating the user');
        return await ctx.db.user.update({
          where: { id: ctx.user.id },
          data: input,
        });
      } catch (e) {
        ctx.logger.warn('An error occured while updating the user');
        throw new ExtendedTRPCError({
          cause: e,
        });
      }
    }),

  updateEmail: protectedProcedure
    .meta({
      openapi: {
        method: 'PUT',
        path: '/accounts/update-email/',
        protect: true,
        tags: ['accounts'],
      },
    })
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .output(z.void())
    .mutation(async () => {
      // TODO send email
      return;
    }),

  updateEmailValidate: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/accounts/update-email/',
        protect: true,
        tags: ['accounts'],
      },
    })
    .input(z.void())
    .output(z.void())
    .mutation(async () => {
      // TODO
      return;
    }),
});
