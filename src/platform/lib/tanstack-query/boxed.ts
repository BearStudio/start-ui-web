import {
  AsyncData,
  type AsyncData as BoxedAsyncData,
  type Option as BoxedOption,
  Option,
  type Result as BoxedResult,
  Result,
} from '@swan-io/boxed';
import type { UseQueryResult } from '@tanstack/react-query';

type QueryStateForBoxed<TData, TError> = Pick<
  UseQueryResult<TData, TError>,
  'data' | 'error' | 'fetchStatus' | 'status'
>;

/**
 * Project TanStack Query's lifecycle into Boxed for rendering without putting
 * Boxed values into the Query cache or SSR payload.
 */
export function queryToAsyncData<TData, TError>(
  query: QueryStateForBoxed<TData, TError>
): BoxedAsyncData<TData> {
  if (query.status === 'success') {
    return AsyncData.Done(query.data as TData);
  }

  if (query.fetchStatus !== 'idle') {
    return AsyncData.Loading();
  }

  return AsyncData.NotAsked();
}

export function queryToAsyncResult<TData, TError>(
  query: QueryStateForBoxed<TData, TError>
): BoxedAsyncData<BoxedResult<TData, TError>> {
  if (query.status === 'success') {
    return AsyncData.Done(Result.Ok(query.data as TData));
  }

  if (query.status === 'error') {
    return AsyncData.Done(Result.Error(query.error as TError));
  }

  if (query.fetchStatus !== 'idle') {
    return AsyncData.Loading();
  }

  return AsyncData.NotAsked();
}

export function nullableQueryToAsyncOption<TData, TError>(
  query: QueryStateForBoxed<TData | null, TError>
): BoxedAsyncData<BoxedOption<TData>> {
  return queryToAsyncData(query).map((value) => Option.fromNullable(value));
}

export function nullableQueryToAsyncOptionResult<TData, TError>(
  query: QueryStateForBoxed<TData | null, TError>
): BoxedAsyncData<BoxedResult<BoxedOption<TData>, TError>> {
  return queryToAsyncResult(query).mapOk((value) => Option.fromNullable(value));
}
