import { match } from 'ts-pattern';

import { OAuthProvider } from '@/features/auth/oauth-config';
import { discord } from '@/server/config/oauth/providers/discord';
import { github } from '@/server/config/oauth/providers/github';
import { google } from '@/server/config/oauth/providers/google';

export const oAuthProvider = (provider: OAuthProvider) => {
  return match(provider)
    .with('github', () => github)
    .with('google', () => google)
    .with('discord', () => discord)
    .exhaustive();
};
