import { beforeEach, vi } from 'vitest';

// --- Module mocks ---
// These vi.mock calls run in the setup file context before each test file,
// providing shared mocks for all server router unit tests.

export const mockGetSession = vi.fn();
export const mockUserHasPermission = vi.fn();

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
    child: () => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

// Auto-mock @/server/db: any model property returns a proxy where
// every method is a vi.fn(), so tests don't need to declare the shape.
import type { Mock } from 'vitest';

import type { PrismaClient } from '@/server/db/generated/client';

type ModelKeys = {
  [K in keyof PrismaClient]: PrismaClient[K] extends { findMany: unknown }
    ? K
    : never;
}[keyof PrismaClient];

type MockedModel<T> = { [K in keyof T]: Mock };
type MockedDb = { [K in ModelKeys]: MockedModel<PrismaClient[K]> };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockDb: MockedDb = new Proxy({} as any, {
  get(target: Record<string, Record<string, unknown>>, model: string) {
    if (!(model in target)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      target[model] = new Proxy({} as any, {
        get(methodTarget: Record<string, unknown>, method: string) {
          if (!(method in methodTarget)) {
            methodTarget[method] = vi.fn();
          }
          return methodTarget[method];
        },
      });
    }
    return target[model];
  },
});

vi.mock('@/server/db', () => ({ db: mockDb }));

// --- Helpers ---

export const mockUser = { id: 'user-1', name: 'Test User' };
export const mockSession = { id: 'session-1' };

export function setupAuthenticatedUser() {
  mockGetSession.mockResolvedValue({
    user: mockUser,
    session: mockSession,
  });
  mockUserHasPermission.mockResolvedValue({ success: true, error: false });
}

beforeEach(() => {
  vi.clearAllMocks();
  setupAuthenticatedUser();
});
