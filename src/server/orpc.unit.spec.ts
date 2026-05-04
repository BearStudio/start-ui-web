import { describe, expect, it } from 'vitest';

import { isPgError } from '@/server/orpc';

const buildPgError = (
  overrides: Partial<
    Error & {
      code: string;
      file: string;
      line: string;
      routine: string;
      severity: string;
    }
  > = {}
) =>
  Object.assign(new Error('PG error'), {
    code: '23505',
    file: 'nbtinsert.c',
    line: '666',
    routine: '_bt_check_unique',
    severity: 'ERROR',
    ...overrides,
  });

describe('isPgError', () => {
  it('accepts Postgres-shaped errors', () => {
    expect(isPgError(buildPgError())).toBe(true);
  });

  it('rejects generic coded errors', () => {
    const error = Object.assign(new Error('Conflict'), { code: '23505' });

    expect(isPgError(error)).toBe(false);
  });

  it('rejects non-Postgres error codes', () => {
    const error = buildPgError({ code: 'BAD_CODE' });

    expect(isPgError(error)).toBe(false);
  });

  it('rejects plain objects with Postgres-looking fields', () => {
    const error = {
      code: '23505',
      file: 'nbtinsert.c',
      line: '666',
      routine: '_bt_check_unique',
      severity: 'ERROR',
    };

    expect(isPgError(error)).toBe(false);
  });
});
