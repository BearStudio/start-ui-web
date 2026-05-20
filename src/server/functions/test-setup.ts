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

vi.mock('@/modules/kernel/infrastructure/logger/pino', () => ({
  logger: {
    info: (...args: unknown[]) => mockLogger.info(...args),
    warn: (...args: unknown[]) => mockLogger.warn(...args),
    error: (...args: unknown[]) => mockLogger.error(...args),
  },
}));

vi.mock('@/modules/kernel/infrastructure/db/client', () => ({
  db: mockDb,
  transactionRunner: {
    run: (work: (tx: typeof mockDb) => Promise<unknown>) => work(mockDb),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  resetMockDb();
  setupAuthenticatedUser();
});
