import { beforeEach, vi } from 'vitest';

import {
  mockDb,
  mockGetSession,
  mockLogger,
  mockUserHasPermission,
  resetMockDb,
  setupAuthenticatedUser,
} from '@/tests/server/test-utils';

vi.mock('@/modules/auth/infrastructure/better-auth/auth', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      userHasPermission: (...args: unknown[]) => mockUserHasPermission(...args),
    },
  },
  createAuth: () => ({
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      userHasPermission: (...args: unknown[]) => mockUserHasPermission(...args),
    },
  }),
  getDefaultAuth: () => ({
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      userHasPermission: (...args: unknown[]) => mockUserHasPermission(...args),
    },
  }),
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

vi.mock('@/modules/kernel/infrastructure/logger/pino', () => ({
  createPinoLogger: () => ({
    child: () => mockLogger,
    info: (...args: unknown[]) => mockLogger.info(...args),
    warn: (...args: unknown[]) => mockLogger.warn(...args),
    error: (...args: unknown[]) => mockLogger.error(...args),
  }),
  getDefaultPinoLogger: () => ({
    child: () => mockLogger,
    info: (...args: unknown[]) => mockLogger.info(...args),
    warn: (...args: unknown[]) => mockLogger.warn(...args),
    error: (...args: unknown[]) => mockLogger.error(...args),
  }),
  logger: {
    child: () => mockLogger,
    info: (...args: unknown[]) => mockLogger.info(...args),
    warn: (...args: unknown[]) => mockLogger.warn(...args),
    error: (...args: unknown[]) => mockLogger.error(...args),
  },
}));

vi.mock('@/modules/kernel/infrastructure/db/client', () => ({
  db: mockDb,
  createDbClient: () => mockDb,
  getDefaultDbClient: () => mockDb,
  createTransactionRunner: (database: typeof mockDb = mockDb) => ({
    run: (work: (tx: typeof mockDb) => Promise<unknown>) => work(database),
  }),
  getDefaultTransactionRunner: () => ({
    run: (work: (tx: typeof mockDb) => Promise<unknown>) => work(mockDb),
  }),
  transactionRunner: {
    run: (work: (tx: typeof mockDb) => Promise<unknown>) => work(mockDb),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  resetMockDb();
  setupAuthenticatedUser();
});
