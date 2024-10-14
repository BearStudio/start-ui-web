import { TRPCError } from '@trpc/server';
import { Google } from 'arctic';
import { z } from 'zod';

import { env } from '@/env.mjs';
import { OAuthClient, getOAuthCallbackUrl } from '@/server/config/oauth/utils';

const zGoogleUser = () =>
  z.object({
    sub: z.string(),
    name: z.string().nullish(),
    email: z.string().email().nullish(),
    email_verified: z.boolean().nullish(),
  });

const googleClient =
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? new Google(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        getOAuthCallbackUrl('google')
      )
    : null;

export const google: OAuthClient = {
  shouldUseCodeVerifier: true,
  createAuthorizationUrl: async (state, codeVerifier) => {
    if (!googleClient) {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Missing Google environment variables',
      });
    }
    if (!codeVerifier) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Missing codeVerifier',
      });
    }
    return await googleClient.createAuthorizationURL(state, codeVerifier, {
      scopes: ['email', 'profile'],
    });
  },
  validateAuthorizationCode: async (code, codeVerifier) => {
    if (!googleClient) {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Missing Google environment variables',
      });
    }
    if (!codeVerifier) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Missing codeVerifier',
      });
    }
    return googleClient.validateAuthorizationCode(code, codeVerifier);
  },
  getUser: async ({ accessToken, ctx }) => {
    ctx.logger.info('Get the user from Google');

    const userResponse = await fetch(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!userResponse.ok) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve the Google user',
      });
    }

    const userData = await userResponse.json();
    ctx.logger.info('User data retrieved from Google');

    ctx.logger.info('Parse the Google user');
    const googleUser = zGoogleUser().safeParse(userData);

    if (googleUser.error) {
      ctx.logger.error(googleUser.error.formErrors.fieldErrors);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to parse the Google user',
      });
    }

    return {
      id: googleUser.data.sub,
      name: googleUser.data.name,
      email: googleUser.data.email,
      isEmailVerified: !!googleUser.data.email_verified,
    };
  },
};
