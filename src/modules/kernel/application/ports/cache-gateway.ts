export interface CacheGateway {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, options?: { ttlMs?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}
