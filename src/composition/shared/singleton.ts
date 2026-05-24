export function createCachedFactory<T, O>(build: (overrides?: O) => T) {
  let cached: T | undefined;
  let hasCached = false;

  return {
    get(overrides?: O): T {
      if (overrides !== undefined) return build(overrides);
      if (!hasCached) {
        cached = build();
        hasCached = true;
      }
      return cached as T;
    },
    reset(): void {
      cached = undefined;
      hasCached = false;
    },
  };
}
