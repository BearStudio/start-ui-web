import type { CacheKey } from '../../domain/ids';

export interface CacheGateway {
  get<T>(key: CacheKey): Promise<T | undefined>;
  set<T>(key: CacheKey, value: T, options?: { ttlMs?: number }): Promise<void>;
  delete(key: CacheKey): Promise<void>;
}
