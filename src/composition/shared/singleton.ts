export function createCachedFactory<T>(build: () => T) {
  let cached: T | undefined;
  let hasCached = false;

  return (hasOverrides = false): T => {
    if (hasOverrides) return build();
    if (!hasCached) {
      cached = build();
      hasCached = true;
    }
    return cached as T;
  };
}
