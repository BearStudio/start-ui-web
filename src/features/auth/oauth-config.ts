import { FC } from 'react';

import { FaDiscord, FaGithub, FaGoogle } from 'react-icons/fa6';
import { entries } from 'remeda';
import { z } from 'zod';

// See Artic documentation to setup and/or add more providers https://arcticjs.dev/

export type OAuthProvider = z.infer<ReturnType<typeof zOAuthProvider>>;
export const zOAuthProvider = () => z.enum(['github', 'google', 'discord']);

export const OAUTH_PROVIDERS = {
  github: {
    isEnabled: true,
    order: 1,
    label: 'GitHub',
    icon: FaGithub,
  },
  discord: {
    isEnabled: true,
    order: 2,
    label: 'Discord',
    icon: FaDiscord,
  },
  google: {
    isEnabled: true,
    order: 3,
    label: 'Google',
    icon: FaGoogle,
  },
} satisfies Record<
  OAuthProvider,
  { isEnabled: boolean; order: number; label: string; icon: FC }
>;

export const OAUTH_PROVIDERS_ENABLED_ARRAY = entries(OAUTH_PROVIDERS)
  .map(([key, value]) => ({
    provider: key,
    ...value,
  }))
  .filter((p) => p.isEnabled)
  .sort((a, b) => a.order - b.order);
