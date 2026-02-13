import { call } from '@orpc/server';
import { describe, expect, it, vi } from 'vitest';

import configRouter from '@/server/routers/config';
import {
  mockGetSession,
  mockUserHasPermission,
} from '@/server/routers/test-utils';

vi.mock('@/env/client', () => ({
  envClient: {
    VITE_ENV_NAME: 'TEST',
    VITE_ENV_COLOR: 'blue',
    VITE_ENV_EMOJI: undefined,
    VITE_IS_DEMO: false,
  },
}));

describe('config router', () => {
  describe('env', () => {
    it('should return environment config', async () => {
      const result = await call(configRouter.env, undefined);

      expect(result).toEqual({
        name: 'TEST',
        color: 'blue',
        emoji: undefined,
        isDemo: false,
        isDev: expect.any(Boolean),
      });
    });

    it('should not require authentication', async () => {
      mockGetSession.mockResolvedValue(null);
      await call(configRouter.env, undefined);

      expect(mockUserHasPermission).not.toHaveBeenCalled();
    });
  });
});
