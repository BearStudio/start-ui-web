import { beforeEach, vi } from 'vitest';

import {
  mockDb,
  mockGetSession,
  mockLogger,
  mockUserHasPermission,
  resetMockDb,
  setupAuthenticatedUser,
} from '@/server/functions/test-utils';

vi.mock('@/server/auth', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      userHasPermission: (...args: unknown[]) => mockUserHasPermission(...args),
    },
  },
}));

vi.mock('@tanstack/react-start/server', () => ({
  getRequestHeaders: () => new Headers(),
  setResponseHeader: vi.fn(),
}));

vi.mock('@/env/client', () => ({
  envClient: {
    VITE_IS_DEMO: false,
  },
}));

vi.mock('@/env/server', () => ({
  envServer: {
    LOGGER_LEVEL: 'error',
    LOGGER_PRETTY: false,
  },
}));

vi.mock('@/server/logger', () => ({
  logger: {
    child: () => mockLogger,
  },
}));

vi.mock('@/server/db', () => ({ db: mockDb }));

beforeEach(() => {
  vi.clearAllMocks();
  resetMockDb();
  setupAuthenticatedUser();
});
