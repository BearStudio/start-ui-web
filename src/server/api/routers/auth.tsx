import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { z } from 'zod';

import EmailActivateAccount from '@/emails/templates/activate-account';
import EmailResetPassword from '@/emails/templates/reset-password';
import i18n from '@/lib/i18n/server';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { AUTH_COOKIE_NAME } from '@/server/auth';
import { prismaThrowFormatedTRPCError } from '@/server/db';
import { sendEmail } from '@/server/email';

export const authRouter = createTRPCRouter({
  checkAuthenticated: publicProcedure.query(async ({ ctx }) => {
    return !!ctx.user;
  }),

  login: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/login',
        tags: ['auth'],
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
        name: AUTH_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: true,
      });

      return {
        token,
      };
    }),

  logout: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/logout',
        tags: ['auth'],
      },
    })
    .input(z.void())
    .output(z.void())
    .mutation(async () => {
      cookies().delete('auth');
    }),

  register: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/register',
        tags: ['auth'],
      },
    })
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
        name: z.string(),
        language: z.string(),
      })
    )
    .output(z.void())
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

      const link = `${process.env.NEXT_PUBLIC_BASE_URL}/register/activate?token=${token}`;

      await sendEmail({
        to: input.email,
        subject: i18n.t('emails:activateAccount.subject', {
          lng: user.language,
        }),
        template: (
          <EmailActivateAccount
            language={user.language}
            name={user.name ?? ''}
            link={link}
          />
        ),
      });

      return undefined;
    }),

  activate: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/register/activate',
        tags: ['auth'],
      },
    })
    .input(z.object({ token: z.string().optional() }))
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      // Clear all expired tokens
      await ctx.db.verificationToken.deleteMany({
        where: { expires: { lt: new Date() } },
      });

      if (!input.token) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

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
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/reset-password/request',
        tags: ['auth'],
      },
    })
    .input(z.object({ email: z.string().email() }))
    .output(z.void())
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

      const link = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/confirm?token=${token}`;

      await sendEmail({
        to: input.email,
        subject: i18n.t('emails:resetPassword.subject', { lng: user.language }),
        template: (
          <EmailResetPassword
            language={user.language}
            name={user.name ?? ''}
            link={link}
          />
        ),
      });

      return undefined;
    }),

  resetPasswordConfirm: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/reset-password/confirm',
        tags: ['auth'],
      },
    })
    .input(z.object({ token: z.string(), newPassword: z.string() }))
    .output(z.void())
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
