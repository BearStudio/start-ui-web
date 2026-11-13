import { COMMON_ERROR_STATUS_MAP } from '@orpc/client';
import { error } from '@orpc/contract';

/**
 * Thrown by the API when a mutation is attempted while demo mode is enabled.
 * `instanceof` matches on the error code, so it also works on errors received by the client.
 */
export const DemoModeError = error('DEMO_MODE_ENABLED', {
  message: 'Demo mode is enabled',
});

/**
 * ORPCError code -> HTTP status, shared by the API handlers, the OpenAPI generator and the logger.
 * Codes missing from the map fall back to `DEFAULT_ERROR_STATUS` (400).
 */
export const ERROR_STATUS_MAP: Record<string, number> = {
  ...COMMON_ERROR_STATUS_MAP,
  [DemoModeError.code]: COMMON_ERROR_STATUS_MAP.METHOD_NOT_SUPPORTED,
};
