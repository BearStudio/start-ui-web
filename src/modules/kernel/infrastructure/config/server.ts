import { getAuthProviderConfig, getBetterAuthConfig } from './auth';
import { getDatabaseConfig } from './database';
import { getEmailConfig } from './email';
import { getLoggerConfig } from './logger';
import { getRedisConfig } from './redis';
import { getStorageConfig } from './storage';
import { getTelemetryConfig } from './telemetry';

export function validateServerConfig() {
  const authProviderConfig = getAuthProviderConfig();
  if (authProviderConfig.provider === 'better-auth') {
    getBetterAuthConfig();
  }
  getDatabaseConfig();
  getEmailConfig();
  getLoggerConfig();
  getRedisConfig();
  getStorageConfig();
  getTelemetryConfig();
}

validateServerConfig();
