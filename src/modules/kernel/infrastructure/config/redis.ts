import { z } from 'zod';

import { baseEnvSchema, parseEnv, zNonEmptyEnvString } from './env-schema';

const redisEnvSchema = baseEnvSchema.extend({
  UPSTASH_REDIS_REST_URL: z.url().optional(),
  UPSTASH_REDIS_REST_TOKEN: zNonEmptyEnvString().optional(),
});

export type RedisConfig = {
  restUrl: string;
  restToken: string;
};

let cachedRedisConfig: RedisConfig | null | undefined;

export function getRedisConfig(): RedisConfig | null {
  if (cachedRedisConfig !== undefined) return cachedRedisConfig;

  const env = parseEnv(redisEnvSchema);
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    cachedRedisConfig = null;
    return cachedRedisConfig;
  }

  cachedRedisConfig = {
    restUrl: env.UPSTASH_REDIS_REST_URL,
    restToken: env.UPSTASH_REDIS_REST_TOKEN,
  };
  return cachedRedisConfig;
}
