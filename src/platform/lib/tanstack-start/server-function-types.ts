export type ServerFunctionFacade<
  TFunctions extends Record<PropertyKey, unknown>,
> = {
  [TKey in keyof TFunctions]: TFunctions[TKey] extends (
    ...args: infer TArgs
  ) => infer TResult
    ? (...args: TArgs) => TResult
    : never;
};
