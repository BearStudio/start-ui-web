import { beforeEach, vi } from 'vitest';

import {
  mockDb,
  mockGetSession,
  mockLogger,
  mockUserHasPermission,
  resetMockDb,
  setupAuthenticatedUser,
} from '@/tests/server/test-utils';

vi.mock('@/modules/auth/infrastructure/better-auth/auth', () => {
  const defaultAuth = {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      userHasPermission: (...args: unknown[]) => mockUserHasPermission(...args),
    },
  };

  return {
    auth: defaultAuth,
    createAuth: () => ({
      api: {
        getSession: (...args: unknown[]) => mockGetSession(...args),
        userHasPermission: (...args: unknown[]) =>
          mockUserHasPermission(...args),
      },
    }),
    getDefaultAuth: () => defaultAuth,
  };
});

vi.mock('@tanstack/react-start/server', () => ({
  getCookie: vi.fn(() => undefined),
  getRequestHeaders: () => new Headers(),
  setCookie: vi.fn(),
  setResponseHeader: vi.fn(),
}));

vi.mock('@/platform/env/client', () => ({
  envClient: {
    VITE_IS_DEMO: false,
  },
}));

vi.mock('@/modules/kernel/infrastructure/logger/pino', () => {
  const defaultPinoLogger = {
    child: () => mockLogger,
    debug: (...args: unknown[]) => mockLogger.debug(...args),
    info: (...args: unknown[]) => mockLogger.info(...args),
    warn: (...args: unknown[]) => mockLogger.warn(...args),
    error: (...args: unknown[]) => mockLogger.error(...args),
  };

  return {
    createPinoAppLogger: ({
      pino,
    }: {
      pino: {
        debug: (...args: unknown[]) => void;
        info: (...args: unknown[]) => void;
        warn: (...args: unknown[]) => void;
        error: (...args: unknown[]) => void;
      };
    }) => ({
      debug: (fields: { event: string }) => pino.debug(fields),
      info: (fields: { event: string }) => pino.info(fields),
      warn: (fields: { event: string }) => pino.warn(fields),
      error: (fields: { event: string }) => pino.error(fields),
    }),
    createPinoLogger: () => ({
      child: () => mockLogger,
      debug: (...args: unknown[]) => mockLogger.debug(...args),
      info: (...args: unknown[]) => mockLogger.info(...args),
      warn: (...args: unknown[]) => mockLogger.warn(...args),
      error: (...args: unknown[]) => mockLogger.error(...args),
    }),
    getDefaultPinoLogger: () => defaultPinoLogger,
    logger: defaultPinoLogger,
  };
});

vi.mock('@/modules/kernel/infrastructure/db/client', () => {
  const defaultTransactionRunner = {
    run: (work: (tx: typeof mockDb) => Promise<unknown>) => work(mockDb),
  };

  return {
    db: mockDb,
    createDbClient: () => mockDb,
    getDefaultDbClient: () => mockDb,
    createTransactionRunner: (database: typeof mockDb = mockDb) => ({
      run: (work: (tx: typeof mockDb) => Promise<unknown>) => work(database),
    }),
    getDefaultTransactionRunner: () => defaultTransactionRunner,
    transactionRunner: defaultTransactionRunner,
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  resetMockDb();
  setupAuthenticatedUser();
});
