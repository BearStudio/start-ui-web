import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';

import { sanitizeLogFields } from './sanitize-log-fields';

const sensitiveKeys = new Set([
  'email',
  'id',
  'identifier',
  'name',
  'phone',
  'user',
]);

describe('sanitizeLogFields', () => {
  it('redacts sensitive keys and email-shaped strings', () => {
    expect(
      sanitizeLogFields(
        {
          email: 'person@example.com',
          message: 'Sent to person@example.com',
          nested: {
            id: 'user-123',
            safe: 'kept',
          },
        },
        { sensitiveKeys }
      )
    ).toEqual({
      email: '[REDACTED]',
      message: 'Sent to [REDACTED]',
      nested: {
        id: '[REDACTED]',
        safe: 'kept',
      },
    });
  });

  it('preserves supported non-plain values in serialized output', () => {
    const at = new Date('2026-05-26T12:00:00.000Z');
    const sanitized = sanitizeLogFields(
      {
        at,
        pattern: /login-\d+/i,
      },
      { sensitiveKeys }
    );

    expect(JSON.parse(JSON.stringify(sanitized))).toEqual({
      at: '2026-05-26T12:00:00.000Z',
      pattern: '/login-\\d+/i',
    });
  });

  it('preserves binary views without converting them to indexed objects', () => {
    const bytes = new Uint8Array([1, 2, 3]);
    const buffer = Buffer.from([4, 5, 6]);

    const sanitized = sanitizeLogFields(
      {
        buffer,
        bytes,
      },
      { sensitiveKeys }
    );

    expect(sanitized.bytes).toBe(bytes);
    expect(sanitized.buffer).toBe(buffer);
  });

  it('does not return raw non-plain objects that can bypass redaction', () => {
    class SecretPayload {
      toJSON() {
        return { email: 'person@example.com' };
      }
    }

    const payload = new SecretPayload();
    const sanitized = sanitizeLogFields({ payload }, { sensitiveKeys });

    expect(sanitized.payload).toBe('[NonPlainObject]');
    expect(sanitized.payload).not.toBe(payload);
    expect(JSON.stringify(sanitized)).not.toContain('person@example.com');
  });

  it('marks true circular references without throwing', () => {
    const fields: Record<string, unknown> = { email: 'person@example.com' };
    fields.self = fields;

    expect(sanitizeLogFields(fields, { sensitiveKeys })).toEqual({
      email: '[REDACTED]',
      self: '[Circular]',
    });
  });

  it('does not mark reused non-circular references as circular', () => {
    const shared = { safe: 'kept' };

    expect(
      sanitizeLogFields(
        {
          first: shared,
          second: shared,
          list: [shared, shared],
        },
        { sensitiveKeys }
      )
    ).toEqual({
      first: { safe: 'kept' },
      second: { safe: 'kept' },
      list: [{ safe: 'kept' }, { safe: 'kept' }],
    });
  });
});
