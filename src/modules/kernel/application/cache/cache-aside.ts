import type { CacheGateway } from '@/modules/kernel/application/ports/cache-gateway';
import type { CacheKey } from '@/modules/kernel/domain/ids';

export async function cacheAside<T>(options: {
  cache: CacheGateway;
  key: CacheKey;
  load: () => Promise<T>;
  ttlMs?: number;
}): Promise<T> {
  const cached = await options.cache.get<T>(options.key);
  if (cached !== undefined) return cached;

  const value = await options.load();
  await options.cache.set(options.key, value, { ttlMs: options.ttlMs });
  return value;
}
