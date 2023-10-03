import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';

import { zUserRole } from '@/server/api/routers/users';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { ExtendedTRPCError } from '@/server/db';

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
        email: z.string().email(),
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

  updatePassword: protectedProcedure
    .meta({
      openapi: {
        method: 'PATCH',
        path: '/accounts/me/password',
        protect: true,
        tags: ['accounts'],
      },
    })
    .input(z.object({ currentPassword: z.string(), newPassword: z.string() }))
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      ctx.logger.debug('Getting current user based on context user id');
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
      });

      if (!currentUser?.password) {
        ctx.logger.fatal(
          { userId: currentUser?.id },
          'Current user does not have any password'
        );

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Missing password on user',
        });
      }

      ctx.logger.debug('Comparing current password with the one in database');
      const isPasswordValid = await bcrypt.compare(
        input.currentPassword,
        currentUser.password
      );

      if (!isPasswordValid) {
        ctx.logger.warn(
          'Current passwords and the one in database do not match'
        );
        throw new TRPCError({
          code: 'UNAUTHORIZED',
        });
      }

      ctx.logger.debug('Hashing new password and saving it to database');
      const passwordHash = await bcrypt.hash(input.newPassword, 12);
      await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: {
          password: passwordHash,
        },
      });

      ctx.logger.debug('End of the procedure');
      return undefined;
    }),
});
