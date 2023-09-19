import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { prismaThrowFormatedTRPCError } from '@/server/db';

export const authRouter = createTRPCRouter({
  checkAuthenticated: publicProcedure.query(async ({ ctx }) => {
    return !!ctx.user;
  }),

  login: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/login',
        tags: ['accounts'],
      },
    })
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .output(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (!user?.password || !user?.activated) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
        });
      }

      const isPasswordValid = await bcrypt.compare(
        input.password,
        user.password
      );

      if (!isPasswordValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
        });
      }

      const token = await jwt.sign({ id: user.id }, process.env.AUTH_SECRET);
      if (!token) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create the JWT token',
        });
      }

      cookies().set({
        name: 'auth',
        value: token,
        httpOnly: true,
      });

      return {
        token,
      };
    }),

  logout: publicProcedure.mutation(async () => {
    cookies().delete('auth');
  }),

  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
        name: z.string(),
        language: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const passwordHash = await bcrypt.hash(input.password, 12);

      let user;
      try {
        user = await ctx.db.user.create({
          data: {
            email: input.email.toLowerCase().trim(),
            password: passwordHash,
            name: input.name,
            language: input.language,
          },
        });
      } catch (e) {
        prismaThrowFormatedTRPCError(e);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        });
      }

      const token = randomUUID();
      await ctx.db.verificationToken.create({
        data: {
          userId: user.id,
          token,
          expires: dayjs().add(1, 'hour').toDate(),
        },
      });

      // REPLACE ME WITH EMAIL SERVICE
      console.log(`👇👇👇👇👇👇👇👇👇👇
✉️ Activation link: ${process.env.NEXT_PUBLIC_BASE_URL}/register/activate?token=${token}
👆👆👆👆👆👆👆👆👆👆`);

      return undefined;
    }),

  activate: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      // Clear all expired tokens
      await ctx.db.verificationToken.deleteMany({
        where: { expires: { lt: new Date() } },
      });

      const verificationToken = await ctx.db.verificationToken.findUnique({
        where: { token: input.token },
      });

      if (!verificationToken) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const [user] = await ctx.db.$transaction([
        ctx.db.user.update({
          where: { id: verificationToken.userId },
          data: { activated: true },
        }),
        ctx.db.verificationToken.delete({
          where: { token: verificationToken.token },
        }),
      ]);

      if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      return undefined;
    }),

  resetPasswordRequest: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const token = randomUUID();

      const user = await ctx.db.user.findFirst({
        where: { email: input.email },
      });

      if (!user) {
        // Silent failure for security
        return undefined;
      }

      await ctx.db.verificationToken.create({
        data: {
          userId: user.id,
          token,
          expires: dayjs().add(1, 'hour').toDate(),
        },
      });

      // REPLACE ME WITH EMAIL SERVICE
      console.log(`👇👇👇👇👇👇👇👇👇👇
  ✉️ Reset password link: ${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/confirm?token=${token}
  👆👆👆👆👆👆👆👆👆👆`);

      return undefined;
    }),

  resetPasswordConfirm: publicProcedure
    .input(z.object({ token: z.string(), newPassword: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.verificationToken.deleteMany({
        where: { expires: { lt: new Date() } },
      });

      const verificationToken = await ctx.db.verificationToken.findUnique({
        where: { token: input.token },
      });

      if (!verificationToken) {
        throw new TRPCError({
          code: 'FORBIDDEN',
        });
      }

      const passwordHash = await bcrypt.hash(input.newPassword, 12);

      const [user] = await ctx.db.$transaction([
        ctx.db.user.update({
          where: { id: verificationToken.userId },
          data: { password: passwordHash },
        }),
        ctx.db.verificationToken.delete({ where: { token: input.token } }),
      ]);

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
        });
      }

      return undefined;
    }),
});
