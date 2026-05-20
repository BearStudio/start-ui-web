export function createCachedFactory<T>(build: () => T) {
  let cached: T | undefined;

  return (hasOverrides = false): T => {
    if (hasOverrides) return build();
    cached ??= build();
    return cached;
  };
}
