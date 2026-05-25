export type ServerFnContextRunner<TContext> = <TResult>(
  fn: (ctx: TContext) => Promise<TResult>
) => Promise<TResult>;

type ServerFunctionHandlerOptions<TDeps, TContext> = {
  getDeps: () => Promise<TDeps> | TDeps;
  selectRunner: (deps: TDeps) => ServerFnContextRunner<TContext>;
};

type ServerFunctionHandlerInput<TDeps, TContext, TData, TResult> =
  ServerFunctionHandlerOptions<TDeps, TContext> & {
    data: TData;
    handler: (
      deps: TDeps,
      ctx: TContext,
      data: TData
    ) => Promise<TResult> | TResult;
  };

export async function runServerFunctionHandler<
  TDeps,
  TContext,
  TData,
  TResult,
>({
  getDeps,
  selectRunner,
  data,
  handler,
}: ServerFunctionHandlerInput<
  TDeps,
  TContext,
  TData,
  TResult
>): Promise<TResult> {
  const deps = await getDeps();
  return selectRunner(deps)((ctx) => Promise.resolve(handler(deps, ctx, data)));
}

export function createServerFunctionInvoker<TDeps, TContext>(
  options: ServerFunctionHandlerOptions<TDeps, TContext>
) {
  return <TData, TResult>(
    data: TData,
    handler: (
      deps: TDeps,
      ctx: TContext,
      data: TData
    ) => Promise<TResult> | TResult
  ) =>
    runServerFunctionHandler({
      ...options,
      data,
      handler,
    });
}
