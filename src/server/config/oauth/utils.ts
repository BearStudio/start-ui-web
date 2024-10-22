import { env } from '@/env.mjs';
import { OAuthProvider } from '@/features/auth/oauth-config';
import { AppContext } from '@/server/config/trpc';

export type OAuthClient = {
  shouldUseCodeVerifier: boolean;
  createAuthorizationUrl: (
    state: string,
    codeVerifier?: string
  ) => Promise<URL>;
  validateAuthorizationCode: (
    code: string,
    codeVerifier?: string
  ) => Promise<{ accessToken: string; refreshToken?: string | null }>;
  getUser: (params: { accessToken: string; ctx: AppContext }) => Promise<{
    id: string;
    name?: string | null;
    email?: string | null;
    isEmailVerified: boolean;
    language?: string | null;
  }>;
};

export const getOAuthCallbackUrl = (provider: OAuthProvider) =>
  `${env.NEXT_PUBLIC_BASE_URL}/oauth/${provider}`;
