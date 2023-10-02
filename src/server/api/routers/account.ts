import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { ExtendedTRPCError } from '@/server/db';

export const accountRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
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
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }

    return user;
  }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        language: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.user.update({
          where: { id: ctx.user.id },
          data: input,
        });
      } catch (e) {
        throw new ExtendedTRPCError({
          cause: e,
        });
      }
    }),

  updatePassword: protectedProcedure
    .input(z.object({ currentPassword: z.string(), newPassword: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
      });
      if (!currentUser?.password) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Missing password on user',
        });
      }

      const isPasswordValid = await bcrypt.compare(
        input.currentPassword,
        currentUser.password
      );

      if (!isPasswordValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
        });
      }

      const passwordHash = await bcrypt.hash(input.newPassword, 12);
      await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: {
          password: passwordHash,
        },
      });

      return undefined;
    }),
});
