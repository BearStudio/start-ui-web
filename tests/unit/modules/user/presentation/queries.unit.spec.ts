import { describe, expect, it, vi } from 'vitest';

import { toScopeKey, toUserId } from '@/modules/kernel/domain/ids';
import { userQueries } from '@/modules/user/client';
import {
  createUserQueries,
  type UserQueryFacade,
} from '@/modules/user/presentation/queries';

describe('user query keys', () => {
  it('partitions protected read keys by scope', () => {
    const scopeA = toScopeKey('scope-a');
    const scopeB = toScopeKey('scope-b');

    expect(userQueries.all()).toEqual(['user', 'v1']);
    expect(userQueries.getAll(scopeA)).toEqual([
      'user',
      'v1',
      { scopeKey: scopeA },
      'getAll',
    ]);
    expect(
      userQueries.getAllInfinite({ scopeKey: scopeA }).queryKey
    ).not.toEqual(userQueries.getAllInfinite({ scopeKey: scopeB }).queryKey);

    expect(
      userQueries.getUserSessionsInfinite({
        userId: toUserId('user-1'),
        scopeKey: scopeA,
      }).queryKey
    ).toContainEqual({ scopeKey: scopeA });
  });

  it('versions mutation keys', () => {
    expect(userQueries.create().mutationKey).toEqual(['user', 'v1', 'create']);
    expect(userQueries.updateById().mutationKey).toEqual([
      'user',
      'v1',
      'updateById',
    ]);
    expect(userQueries.deleteById().mutationKey).toEqual([
      'user',
      'v1',
      'deleteById',
    ]);
    expect(userQueries.revokeUserSessions().mutationKey).toEqual([
      'user',
      'v1',
      'revokeUserSessions',
    ]);
    expect(userQueries.revokeUserSession().mutationKey).toEqual([
      'user',
      'v1',
      'revokeUserSession',
    ]);
  });

  it('calls injected facade functions with server function data payloads', async () => {
    const facade = {
      userCreate: vi.fn(async () => ({ type: 'created' })),
      userDeleteById: vi.fn(async () => ({ type: 'deleted' })),
      userGetAll: vi.fn(async () => ({ items: [], total: 0 })),
      userGetById: vi.fn(async () => ({ id: 'user-1' })),
      userGetUserSessions: vi.fn(async () => ({ items: [], total: 0 })),
      userRevokeUserSession: vi.fn(async () => ({ type: 'revoked' })),
      userRevokeUserSessions: vi.fn(async () => ({ type: 'revoked' })),
      userUpdateById: vi.fn(async () => ({ type: 'updated' })),
    } as unknown as UserQueryFacade;
    const queries = createUserQueries(facade);
    const scopeKey = toScopeKey('scope-a');
    const userId = toUserId('user-1');

    await (
      queries.getAllList({ scopeKey }).queryFn as () => Promise<unknown>
    )();
    await (
      queries.getById({ id: userId, scopeKey })
        .queryFn as () => Promise<unknown>
    )();
    await (
      queries.getUserSessionsInfinite({ userId, scopeKey }).queryFn as (ctx: {
        pageParam: string;
      }) => Promise<unknown>
    )({ pageParam: 'session-1' });
    await (
      queries.updateById().mutationFn as (data: {
        id: string;
      }) => Promise<unknown>
    )({ id: 'user-1' });

    expect(facade.userGetAll).toHaveBeenCalledWith({ data: {} });
    expect(facade.userGetById).toHaveBeenCalledWith({ data: { id: userId } });
    expect(facade.userGetUserSessions).toHaveBeenCalledWith({
      data: { cursor: 'session-1', limit: 20, userId },
    });
    expect(facade.userUpdateById).toHaveBeenCalledWith({
      data: { id: 'user-1' },
    });
  });
});
