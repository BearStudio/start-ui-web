import { vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockUserHasPermission: vi.fn(),
}));

export const mockGetSession = hoisted.mockGetSession;
export const mockUserHasPermission = hoisted.mockUserHasPermission;

import type { Mock } from 'vitest';

import type { PrismaClient } from '@/server/db/generated/client';

type ModelKeys = {
  [K in keyof PrismaClient]: PrismaClient[K] extends { findMany: unknown }
    ? K
    : never;
}[keyof PrismaClient];

type MockedModel<T> = { [K in keyof T]: Mock };
type MockedDb = { [K in ModelKeys]: MockedModel<PrismaClient[K]> };

// Auto-mock @/server/db: any model property returns a proxy where
// every method is a vi.fn(), so tests don't need to declare the shape.
export const mockDb: MockedDb = new Proxy({} as ExplicitAny, {
  get(target: Record<string, Record<string, unknown>>, model: string) {
    if (!(model in target)) {
      target[model] = new Proxy({} as ExplicitAny, {
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

export const mockUser = { id: 'user-1', name: 'Test User' };
export const mockSession = { id: 'session-1' };

export function setupAuthenticatedUser() {
  mockGetSession.mockResolvedValue({
    user: mockUser,
    session: mockSession,
  });
  mockUserHasPermission.mockResolvedValue({ success: true, error: false });
}
