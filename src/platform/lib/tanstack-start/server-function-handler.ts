import { getTelemetry } from '@/platform/telemetry';

export type ServerFnContextRunner<TContext> = <TResult>(
  fn: (ctx: TContext) => Promise<TResult>
) => Promise<TResult>;

type ServerFunctionHandlerOptions<TDeps, TContext> = {
  getDeps: () => Promise<TDeps> | TDeps;
  operationName?: string;
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

const recordServerFunctionMetric = (
  operationName: string,
  start: number,
  status: 'error' | 'success'
) => {
  getTelemetry().recordMetric({
    attributes: {
      'operation.name': operationName,
      'operation.type': 'server_function',
      status,
    },
    name: 'app.server_function.duration',
    type: 'histogram',
    unit: 'ms',
    value: performance.now() - start,
  });
};

export async function runServerFunctionHandler<
  TDeps,
  TContext,
  TData,
  TResult,
>({
  getDeps,
  operationName,
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
  return selectRunner(deps)(async (ctx) => {
    if (!operationName) return handler(deps, ctx, data);

    const start = performance.now();
    return getTelemetry().startSpan(
      {
        attributes: {
          'operation.name': operationName,
          'operation.type': 'server_function',
        },
        name: operationName,
        op: 'server.function',
      },
      async () => {
        try {
          const result = await handler(deps, ctx, data);
          recordServerFunctionMetric(operationName, start, 'success');
          return result;
        } catch (error) {
          recordServerFunctionMetric(operationName, start, 'error');
          throw error;
        }
      }
    );
  });
}

export function createServerFunctionInvoker<TDeps, TContext>(
  options: ServerFunctionHandlerOptions<TDeps, TContext>
) {
  const invoke = <TData, TResult>(
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

  return Object.assign(invoke, {
    withOperation: (operationName: string) =>
      createServerFunctionInvoker({
        ...options,
        operationName,
      }),
  });
}
