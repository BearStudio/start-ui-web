import { TRPCError } from '@trpc/server';
import { GitHub } from 'arctic';
import { z } from 'zod';

import { env } from '@/env.mjs';
import { OAuthClient, getOAuthCallbackUrl } from '@/server/config/oauth/utils';

const zGitHubUser = () =>
  z.object({
    id: z.number(),
    name: z.string().nullish(),
    email: z.string().email().nullish(),
  });

const zGitHubEmails = () =>
  z.array(
    z.object({
      primary: z.boolean().nullish(),
      verified: z.boolean().nullish(),
      email: z.string().nullish(),
    })
  );

const githubClient =
  env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
    ? new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET, {
        redirectURI: getOAuthCallbackUrl('github'),
      })
    : null;

export const github: OAuthClient = {
  shouldUseCodeVerifier: false,
  createAuthorizationUrl: async (state: string) => {
    if (!githubClient) {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Missing GitHub environment variables',
      });
    }
    return await githubClient.createAuthorizationURL(state, {
      scopes: ['user:email'],
    });
  },
  validateAuthorizationCode: async (code: string) => {
    if (!githubClient) {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Missing GitHub environment variables',
      });
    }
    return githubClient.validateAuthorizationCode(code);
  },
  getUser: async ({ accessToken, ctx }) => {
    ctx.logger.info('Get the user from GitHub');
    const [userResponse, emailsResponse] = await Promise.all([
      fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
      fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    ]);

    if (!userResponse.ok) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve GitHub user',
      });
    }

    if (!emailsResponse.ok) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve GitHub emails',
      });
    }

    const emailsData = await emailsResponse.json();
    ctx.logger.info('Retrieved emails from GitHub');

    ctx.logger.info('Parse the GitHub user emails');
    const emails = zGitHubEmails().safeParse(emailsData);

    if (emails.error) {
      ctx.logger.error(
        `Zod error while parsing the GitHub emails: ${JSON.stringify(emails.error.formErrors.fieldErrors, null, 2)}`
      );
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to parse the GitHub emails',
      });
    }

    const primaryEmail = emails.data?.find((email) => email.primary) ?? null;

    const userData = await userResponse.json();
    ctx.logger.info('User data retrieved from GitHub');

    ctx.logger.info('Parse the GitHub user');
    const gitHubUser = zGitHubUser().safeParse(userData);

    if (gitHubUser.error) {
      ctx.logger.error(gitHubUser.error.formErrors.fieldErrors);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to parse the GitHub user',
      });
    }

    return {
      id: gitHubUser.data.id.toString(),
      name: gitHubUser.data.name,
      email: primaryEmail?.email ?? gitHubUser.data.email,
      isEmailVerified: !!primaryEmail?.verified,
    };
  },
};
