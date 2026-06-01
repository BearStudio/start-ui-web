import {
  infiniteQueryOptions,
  type MutationOptions,
  queryOptions,
} from '@tanstack/react-query';

export type ScopedQueryInput<TScopeKey extends string = string> = {
  scopeKey: TScopeKey;
};

type WithoutScope<TInput extends ScopedQueryInput<string>> = Omit<
  TInput,
  'scopeKey'
>;

function withoutScope<TInput extends ScopedQueryInput<string>>(
  input: TInput
): WithoutScope<TInput> {
  const { scopeKey: _scopeKey, ...data } = input;
  return data;
}

export function scopedListQueryOptions<
  TScopeKey extends string,
  TInput extends ScopedQueryInput<TScopeKey>,
  TData,
>(input: {
  baseKey: (scopeKey: TScopeKey) => readonly unknown[];
  input: TInput;
  queryFn: (data: WithoutScope<TInput>) => Promise<TData>;
}) {
  const data = withoutScope(input.input);
  return queryOptions({
    queryKey: [...input.baseKey(input.input.scopeKey), data] as const,
    queryFn: () => input.queryFn(data),
  });
}

export function scopedInfiniteQueryOptions<
  TScopeKey extends string,
  TInput extends ScopedQueryInput<TScopeKey>,
  TCursor,
  TPage extends { nextCursor?: TCursor },
>(input: {
  baseKey: (scopeKey: TScopeKey) => readonly unknown[];
  input: TInput;
  queryFn: (
    data: WithoutScope<TInput>,
    pageParam: TCursor | undefined
  ) => Promise<TPage>;
  maxPages?: number;
}) {
  const data = withoutScope(input.input);
  return infiniteQueryOptions({
    queryKey: [
      ...input.baseKey(input.input.scopeKey),
      'infinite',
      data,
    ] as const,
    queryFn: ({ pageParam }) =>
      input.queryFn(data, pageParam as TCursor | undefined),
    initialPageParam: undefined as TCursor | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    maxPages: input.maxPages ?? 10,
  });
}

export function scopedEntityQueryOptions<
  TScopeKey extends string,
  TInput extends ScopedQueryInput<TScopeKey>,
  TData,
>(input: {
  baseKey: (scopeKey: TScopeKey) => readonly unknown[];
  input: TInput;
  queryFn: (data: WithoutScope<TInput>) => Promise<TData>;
}) {
  const data = withoutScope(input.input);
  return queryOptions({
    queryKey: [...input.baseKey(input.input.scopeKey), data] as const,
    queryFn: () => input.queryFn(data),
  });
}

export function serverMutationOptions<TData, TResult>(input: {
  mutationKey: readonly unknown[];
  mutationFn: (input: { data: TData }) => Promise<TResult>;
}): MutationOptions<TResult, Error, TData> {
  return {
    mutationKey: input.mutationKey,
    mutationFn: (data) => input.mutationFn({ data }),
  };
}
