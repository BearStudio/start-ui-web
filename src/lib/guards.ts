export function isFunction(x: unknown): x is CallableFunction {
  return typeof x === 'function';
}
