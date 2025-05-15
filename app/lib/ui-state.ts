import { ORPCError } from '@orpc/client';
import { UseInfiniteQueryResult, UseQueryResult } from '@tanstack/react-query';

type AvailableStatus =
  | 'pending'
  | 'not-found'
  | 'error'
  | 'empty-search'
  | 'empty'
  | 'default'
  | (string & {}); // Allows extra status

type UiState<
  Status extends AvailableStatus,
  Data extends Record<string, unknown>,
> = {
  is: <S extends Status>(status: S) => boolean;
  state: {
    __status: Status;
  } & Data;
  match: <S extends Status>(
    status: S | Array<S>,
    handler: (
      data: Omit<
        Extract<UiState<Status, Data>['state'], { __status: S }>,
        '__status'
      >
    ) => React.ReactNode | ((...args: ExplicitAny[]) => React.ReactNode),
    __matched?: boolean,
    run?: () => React.ReactNode | ((...args: ExplicitAny[]) => React.ReactNode)
  ) => {
    nonExhaustive: () => React.ReactNode;
  } & (Exclude<Status, S> extends never
    ? {
        exhaustive: () => React.ReactNode;
      }
    : Pick<UiState<Exclude<Status, S>, Data>, 'match'>);
};

type GetState<
  Status extends AvailableStatus,
  Data extends Record<string, unknown>,
> = (
  set: <S extends AvailableStatus, SData extends Record<string, unknown>>(
    status: S,
    data?: SData
  ) => { __status: S } & SData
) => { __status: Status } & Data;

export const getUiState = <
  Status extends AvailableStatus = AvailableStatus,
  Data extends Record<string, unknown> = Record<string, unknown>,
>(
  getState: GetState<Status, Data>
): UiState<Status, Data> => {
  const state = getState((status, data = {} as ExplicitAny) => {
    return {
      __status: status,
      ...data,
    };
  });

  const isMatching = <S extends Status>(status: Status): status is S =>
    status === state.__status;

  const isMatchingArray = <S extends Status>(
    status: Array<Status>
  ): status is Array<S> => status.includes(state.__status);

  const uiState: UiState<Status, Data> = {
    state,
    is: (status) => {
      return state.__status === status;
    },
    match: (status, handler, __matched = false, render = () => null) => {
      if (
        !__matched &&
        (typeof status === 'string'
          ? isMatching(status)
          : isMatchingArray(status as Array<Status>))
      ) {
        return {
          ...(uiState as ExplicitAny),
          __matched: true,
          exhaustive: () => handler(state as ExplicitAny),
          nonExhaustive: () => handler(state as ExplicitAny),
          match: (status, _handler) =>
            uiState.match(status, _handler, true, () => {
              return handler(uiState.state as ExplicitAny);
            }),
        };
      }

      return {
        ...uiState,
        __matched,
        exhaustive: render,
        nonExhaustive: render,
        match: (status, handler) =>
          uiState.match(status, handler, __matched, render),
      };
    },
  };

  return uiState;
};

export const defaultFromQuery =
  <Data>(
    query: UseQueryResult<Data>
  ): GetState<'pending' | 'error' | 'not-found' | 'default', { data: Data }> =>
  (set) => {
    if (query.status === 'pending') return set('pending');
    if (
      query.status === 'error' &&
      query.error instanceof ORPCError &&
      query.error.code === 'NOT_FOUND'
    )
      return set('not-found');
    if (query.status === 'error') return set('error');
    return set('default', { data: query.data });
  };

export const defaultFromInfiniteQuery =
  <Data>(
    query: UseInfiniteQueryResult<{
      pages: { items: Data[] }[];
    }>
  ): GetState<'pending' | 'error' | 'default' | 'empty', { items: Data[] }> =>
  (set) => {
    if (query.isLoading) {
      return set('pending');
    }
    if (query.isError) {
      return set('error');
    }
    if (!query.isFetched) {
      return set('waiting');
    }

    const items = query.data?.pages?.flatMap((p) => p.items) ?? [];
    if (!items.length) {
      return set('empty');
    }

    return set('default', {
      items,
    });
  };
