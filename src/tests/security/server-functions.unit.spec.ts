import { describe, expect, it } from 'vitest';

import { accountUpdateInfo } from '@/modules/account/server';
import { bookGetAll } from '@/modules/book/server-functions';
import { genreGetAll } from '@/modules/genre/server';
import { userGetAll } from '@/modules/user/server';
import {
  mockGetSession,
  mockSession,
  mockUser,
  mockUserHasPermission,
} from '@/tests/server/test-utils';

const protectedReadCalls = [
  {
    data: { limit: 20, searchTerm: '' },
    name: 'bookGetAll',
    serverFn: bookGetAll,
  },
  {
    data: { limit: 20, searchTerm: '' },
    name: 'genreGetAll',
    serverFn: genreGetAll,
  },
  {
    data: { limit: 20, searchTerm: '' },
    name: 'userGetAll',
    serverFn: userGetAll,
  },
] as const;

const SERVER_FUNCTION_SECURITY_TEST_TIMEOUT_MS = 15_000;

describe('protected server functions', () => {
  it.each(protectedReadCalls)(
    'returns 401 for direct unauthenticated calls to $name',
    async ({ data, serverFn }) => {
      mockGetSession.mockResolvedValueOnce(null);

      await expect(serverFn({ data })).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        status: 401,
      });
    },
    SERVER_FUNCTION_SECURITY_TEST_TIMEOUT_MS
  );

  it.each(protectedReadCalls)(
    'returns 403 for direct unauthorized calls to $name',
    async ({ data, serverFn }) => {
      mockGetSession.mockResolvedValueOnce({
        user: mockUser,
        session: mockSession,
      });
      mockUserHasPermission.mockResolvedValue({ success: false, error: false });

      await expect(serverFn({ data })).rejects.toMatchObject({
        code: 'FORBIDDEN',
        status: 403,
      });
    },
    SERVER_FUNCTION_SECURITY_TEST_TIMEOUT_MS
  );

  it(
    'returns 401 for direct unauthenticated account mutations',
    async () => {
      mockGetSession.mockResolvedValueOnce(null);

      await expect(
        accountUpdateInfo({ data: { name: 'User' } })
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        status: 401,
      });
    },
    SERVER_FUNCTION_SECURITY_TEST_TIMEOUT_MS
  );

  it(
    'returns 403 for direct unauthorized account mutations',
    async () => {
      mockGetSession.mockResolvedValueOnce({
        user: mockUser,
        session: mockSession,
      });
      mockUserHasPermission.mockResolvedValue({ success: false, error: false });

      await expect(
        accountUpdateInfo({ data: { name: 'User' } })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
        status: 403,
      });
    },
    SERVER_FUNCTION_SECURITY_TEST_TIMEOUT_MS
  );
});
