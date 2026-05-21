import type { CacheGateway } from '@/modules/kernel/application/ports/cache-gateway';

export async function cacheAside<T>(options: {
  cache: CacheGateway;
  key: string;
  load: () => Promise<T>;
  ttlMs?: number;
}): Promise<T> {
  const cached = await options.cache.get<T>(options.key);
  if (cached !== undefined) return cached;

  const value = await options.load();
  await options.cache.set(options.key, value, { ttlMs: options.ttlMs });
  return value;
}
