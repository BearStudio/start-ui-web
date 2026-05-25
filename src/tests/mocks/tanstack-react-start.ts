type ServerFunctionInput = {
  data?: unknown;
};

type ServerFunctionHandler<TResult> = (
  input: ServerFunctionInput
) => TResult | Promise<TResult>;

type ServerFunction<TResult> = (
  input?: ServerFunctionInput
) => Promise<TResult> | TResult;

type ServerFunctionBuilder<TResult = unknown> = {
  inputValidator: (_validator?: unknown) => ServerFunctionBuilder<TResult>;
  validator: (_validator?: unknown) => ServerFunctionBuilder<TResult>;
  middleware: (_middleware?: unknown) => ServerFunctionBuilder<TResult>;
  handler: <TNextResult>(
    handler: ServerFunctionHandler<TNextResult>
  ) => ServerFunction<TNextResult>;
};

export function createServerFn<
  TResult = unknown,
>(): ServerFunctionBuilder<TResult> {
  const builder: ServerFunctionBuilder<TResult> = {
    inputValidator: () => builder,
    validator: () => builder,
    middleware: () => builder,
    handler: (handler) => (input) => handler(input ?? {}),
  };

  return builder;
}

export function createServerOnlyFn<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => TResult
) {
  return fn;
}

export function createCsrfMiddleware(options?: unknown) {
  return {
    type: 'csrf',
    options,
  };
}

export function createStart<TOptions>(factory: () => TOptions) {
  return {
    options: factory(),
  };
}
