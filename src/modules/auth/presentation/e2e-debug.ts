import { sanitizeLogFields } from '@/platform/lib/redaction/sanitize-log-fields';

import { envClient } from '@/platform/env/client';

type AuthE2eDebugFields = Record<string, unknown>;

const SENSITIVE_FIELD_NAMES = new Set([
  'email',
  'id',
  'identifier',
  'name',
  'phone',
  'user',
]);

const sanitizeDebugFields = (fields: AuthE2eDebugFields): AuthE2eDebugFields =>
  sanitizeLogFields(fields, { sensitiveKeys: SENSITIVE_FIELD_NAMES });

export const authE2eDebug = (
  event: string,
  fields: AuthE2eDebugFields = {}
) => {
  if (envClient.VITE_ENV_NAME !== 'tests') {
    return;
  }

  try {
    console.info(
      `[auth-e2e] ${event}`,
      JSON.stringify({
        at: new Date().toISOString(),
        event,
        ...sanitizeDebugFields(fields),
      })
    );
  } catch (error) {
    console.warn('[auth-e2e] Failed to serialize debug fields', error);
  }
};
