import { getAuthConfig } from './auth';
import { getDatabaseConfig } from './database';
import { getEmailConfig } from './email';
import { getLoggerConfig } from './logger';
import { getRedisConfig } from './redis';
import { getStorageConfig } from './storage';
import { getTelemetryConfig } from './telemetry';

export function validateServerConfig() {
  getAuthConfig();
  getDatabaseConfig();
  getEmailConfig();
  getLoggerConfig();
  getRedisConfig();
  getStorageConfig();
  getTelemetryConfig();
}

validateServerConfig();
