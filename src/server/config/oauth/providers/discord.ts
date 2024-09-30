import { TRPCError } from '@trpc/server';
import { Discord } from 'arctic';
import { z } from 'zod';

import { env } from '@/env.mjs';
import { OAuthClient, getOAuthCallbackUrl } from '@/server/config/oauth/utils';

const zDiscordUser = () =>
  z.object({
    id: z.string(),
    username: z.string().nullish(),
    global_name: z.string().nullish(),
    email: z.string().email().nullish(),
    verified: z.boolean().nullish(),
    locale: z.string().nullish(),
  });

const discordClient =
  env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET
    ? new Discord(
        env.DISCORD_CLIENT_ID,
        env.DISCORD_CLIENT_SECRET,
        getOAuthCallbackUrl('discord')
      )
    : null;

export const discord: OAuthClient = {
  shouldUseCodeVerifier: true,
  createAuthorizationUrl: async (state) => {
    if (!discordClient) {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Missing Discord environment variables',
      });
    }
    return await discordClient.createAuthorizationURL(state, {
      scopes: ['identify', 'email'],
    });
  },
  validateAuthorizationCode: async (code) => {
    if (!discordClient) {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Missing Discord environment variables',
      });
    }
    return discordClient.validateAuthorizationCode(code);
  },
  getUser: async ({ accessToken, ctx }) => {
    ctx.logger.info('Get the user from Discord');

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!userResponse.ok) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve the Discord user',
      });
    }

    const userData = await userResponse.json();
    ctx.logger.info('User data retrieved from Discord');

    ctx.logger.info('Parse the Discord user');
    const discordUser = zDiscordUser().safeParse(userData);

    if (discordUser.error) {
      ctx.logger.error(discordUser.error.formErrors.fieldErrors);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to parse the Discord user',
      });
    }

    return {
      id: discordUser.data.id,
      name: discordUser.data.global_name ?? discordUser.data.username,
      email: discordUser.data.email,
      isEmailVerified: !!discordUser.data.verified,
      language: discordUser.data.locale,
    };
  },
};
