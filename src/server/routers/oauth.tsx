import { User } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { generateCodeVerifier, generateState } from 'arctic';
import { cookies } from 'next/headers';
import { keys } from 'remeda';
import { z } from 'zod';

import { env } from '@/env.mjs';
import { zUserAccount } from '@/features/account/schemas';
import { OAUTH_PROVIDERS, zOAuthProvider } from '@/features/auth/oauth-config';
import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';
import locales from '@/locales';
import { createSession } from '@/server/config/auth';
import { oAuthProvider } from '@/server/config/oauth';
import { createTRPCRouter, publicProcedure } from '@/server/config/trpc';

export const oauthRouter = createTRPCRouter({
  createAuthorizationUrl: publicProcedure()
    .input(
      z.object({
        provider: zOAuthProvider(),
      })
    )
    .output(z.object({ url: z.string().url() }))
    .mutation(async ({ input }) => {
      if (!OAUTH_PROVIDERS[input.provider].isEnabled) {
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: `${input.provider} provider is not enabled`,
        });
      }

      const state = generateState();
      const codeVerifier = generateCodeVerifier();
      const url = await oAuthProvider(input.provider).createAuthorizationUrl(
        state,
        codeVerifier
      );

      cookies().set(`${input.provider}_oauth_state`, state, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        maxAge: 60 * 10, // 10 minutes
        path: '/',
      });

      cookies().set(`${input.provider}_oauth_codeVerifier`, codeVerifier, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        maxAge: 60 * 10, // 10 minutes
        path: '/',
      });

      return {
        url: url.toString(),
      };
    }),

  validateLogin: publicProcedure()
    .input(
      z.object({
        provider: zOAuthProvider(),
        state: z.string().min(1),
        code: z.string().min(1),
        language: z.string().optional(),
      })
    )
    .output(z.object({ token: z.string(), account: zUserAccount() }))
    .mutation(async ({ ctx, input }) => {
      if (!OAUTH_PROVIDERS[input.provider].isEnabled) {
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: `${input.provider} provider is not enabled`,
        });
      }

      const stateFromCookie = z
        .string()
        .safeParse(cookies().get(`${input.provider}_oauth_state`)?.value);

      const codeVerifierFromCookie = z
        .string()
        .safeParse(
          cookies().get(`${input.provider}_oauth_codeVerifier`)?.value
        );

      if (!stateFromCookie.success || stateFromCookie.data !== input.state) {
        ctx.logger.warn('Wrong oAuth state');
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Wrong oAuth state',
        });
      }

      if (
        oAuthProvider(input.provider).shouldUseCodeVerifier &&
        !codeVerifierFromCookie.data
      ) {
        ctx.logger.warn('Invalid or expired authorization request');
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired authorization request',
        });
      }

      let accessToken: string;
      try {
        ctx.logger.info(`Validate the ${input.provider} code`);
        const tokens = await oAuthProvider(
          input.provider
        ).validateAuthorizationCode(input.code, codeVerifierFromCookie.data);
        accessToken = tokens.accessToken;
      } catch {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Failed to validate the ${input.provider} authorization code`,
        });
      }

      let providerUser;
      try {
        providerUser = await oAuthProvider(input.provider).getUser({
          accessToken,
          ctx,
        });
        ctx.logger.debug(providerUser);
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to retrieve the ${input.provider} user`,
        });
      }

      let existingUser: User | undefined;

      ctx.logger.info('Check existing oAuth account');
      const existingOAuthAccount = await ctx.db.oAuthAccount.findFirst({
        where: {
          provider: input.provider,
          providerUserId: providerUser.id,
        },
        include: {
          user: true,
        },
      });

      if (existingOAuthAccount?.user) {
        ctx.logger.info('OAuth account found');
        existingUser = existingOAuthAccount.user;
      } else {
        ctx.logger.info(
          'OAuth account not found, checking for existing user by email (verified)'
        );
        const existingUserByEmail =
          providerUser.email && providerUser.isEmailVerified
            ? await ctx.db.user.findFirst({
                where: {
                  email: providerUser.email,
                  isEmailVerified: true,
                },
              })
            : undefined;

        if (existingUserByEmail) {
          ctx.logger.info('User found with email, creating the OAuth account');
          await ctx.db.oAuthAccount.create({
            data: {
              provider: input.provider,
              providerUserId: providerUser.id,
              userId: existingUserByEmail.id,
            },
          });

          existingUser = existingUserByEmail;
        }
      }

      if (existingUser?.accountStatus === 'DISABLED') {
        ctx.logger.info('Account is disabled');
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message:
            'Unable to authenticate. Please contact support if this issue persists.',
        });
      }

      if (existingUser?.accountStatus === 'NOT_VERIFIED') {
        ctx.logger.error('Account should not be NOT_VERIFIED at this point');
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Please verify your account to proceed',
        });
      }

      if (existingUser) {
        ctx.logger.info('Create the session for the existing user');
        const sessionId = await createSession(existingUser.id);

        return {
          account: existingUser,
          token: sessionId,
        };
      }

      const emailAlreadyExistsUser = providerUser.email
        ? await ctx.db.user.findFirst({
            where: { email: providerUser.email },
          })
        : null;

      if (emailAlreadyExistsUser?.accountStatus === 'NOT_VERIFIED') {
        ctx.logger.info('Email already exists with an NOT_VERIFIED account');
        ctx.logger.info('Update the NOT_VERIFIED user');
        const updatedUser = await ctx.db.user.update({
          where: {
            id: emailAlreadyExistsUser.id,
          },
          data: {
            name: providerUser.name ?? null,
            language:
              keys(locales).find((key) =>
                (providerUser.language ?? input.language)?.startsWith(key)
              ) ?? DEFAULT_LANGUAGE_KEY,
            accountStatus: 'ENABLED',
            isEmailVerified: providerUser.isEmailVerified,
            oauth: {
              create: {
                provider: input.provider,
                providerUserId: providerUser.id,
              },
            },
          },
        });

        ctx.logger.info('Create the session for the updated user');
        const sessionId = await createSession(updatedUser.id);

        return {
          account: updatedUser,
          token: sessionId,
        };
      }

      if (emailAlreadyExistsUser) {
        ctx.logger.warn(
          'The email already exists but we cannot safely take over the account (probably because the email was not verified but the account is enabled). Silent error for security reasons'
        );
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create the account',
        });
      }

      ctx.logger.info('Creating the new user');
      const newUser = await ctx.db.user.create({
        data: {
          email: providerUser.email ?? undefined,
          name: providerUser.name ?? undefined,
          language:
            keys(locales).find((key) =>
              (providerUser.language ?? input.language)?.startsWith(key)
            ) ?? DEFAULT_LANGUAGE_KEY,
          accountStatus: 'ENABLED',
          isEmailVerified: providerUser.isEmailVerified,
          oauth: {
            create: {
              provider: input.provider,
              providerUserId: providerUser.id,
            },
          },
        },
      });

      ctx.logger.info('Create the session for the new user');
      const sessionId = await createSession(newUser.id);

      return {
        account: newUser,
        token: sessionId,
      };
    }),
});
