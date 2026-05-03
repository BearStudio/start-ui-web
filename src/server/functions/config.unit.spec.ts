import { describe, expect, it, vi } from 'vitest';

import { handlers } from '@/server/functions/config.handlers.server';

vi.mock('@/env/client', () => ({
  envClient: {
    VITE_ENV_NAME: 'TEST',
    VITE_ENV_COLOR: 'blue',
    VITE_ENV_EMOJI: undefined,
    VITE_IS_DEMO: false,
  },
}));

describe('config handlers', () => {
  describe('env', () => {
    it('should return environment config', () => {
      const result = handlers.env();

      expect(result).toEqual({
        name: 'TEST',
        color: 'blue',
        emoji: undefined,
        isDemo: false,
        isDev: expect.any(Boolean),
      });
    });
  });
});
