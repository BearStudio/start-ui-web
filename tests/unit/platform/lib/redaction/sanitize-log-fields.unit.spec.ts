import { fc, PROPERTY_DEFAULTS, test } from '@tests/support/property-testing';
import { Buffer } from 'node:buffer';
import { describe, expect, it, vi } from 'vitest';

import { sanitizeLogFields } from '@/platform/lib/redaction/sanitize-log-fields';

const sensitiveKeys = new Set([
  'email',
  'id',
  'identifier',
  'name',
  'phone',
  'user',
]);

const redactionTextCharacters = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  ' ',
  '-',
  '_',
] as const;

const redactionText = fc
  .array(fc.constantFrom(...redactionTextCharacters), { maxLength: 30 })
  .map((characters) => characters.join(''));

const sensitiveKeyVariant = fc
  .constantFrom(...sensitiveKeys)
  .chain((key) =>
    fc.constantFrom(
      key,
      key.toUpperCase(),
      `${key.charAt(0).toUpperCase()}${key.slice(1).toLowerCase()}`
    )
  );

const secretValue = fc.uuid().map((value) => `secret-${value}`);

function sanitizeLogFieldsWithObjectKeysGuard(fields: Record<string, unknown>) {
  const originalObjectKeys = Object.keys;
  const objectKeys = vi
    .spyOn(Object, 'keys')
    .mockImplementation((value: object) => {
      if (value === fields.list) {
        throw new Error('Oversized arrays must not call Object.keys');
      }

      return originalObjectKeys(value);
    });

  try {
    return sanitizeLogFields(fields, { sensitiveKeys });
  } finally {
    objectKeys.mockRestore();
  }
}

describe('sanitizeLogFields', () => {
  it('uses production-safe default sensitive keys without redacting stable ids', () => {
    expect(
      sanitizeLogFields({
        id: 'record-1',
        requestId: 'request-1',
        token: 'secret-token',
      })
    ).toEqual({
      id: 'record-1',
      requestId: 'request-1',
      token: '[REDACTED]',
    });
  });

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
    expect(sanitized.at).toBe(at);
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

  it('serializes and sanitizes non-plain objects with toJSON methods to prevent bypass', () => {
    class SecretPayload {
      toJSON() {
        return { email: 'person@example.com' };
      }
    }

    const payload = new SecretPayload();
    const sanitized = sanitizeLogFields({ payload }, { sensitiveKeys });

    expect(sanitized.payload).toEqual({ email: '[REDACTED]' });
    expect(sanitized.payload).not.toBe(payload);
    expect(JSON.stringify(sanitized)).not.toContain('person@example.com');
  });

  it('serializes and sanitizes plain objects with toJSON methods to prevent bypass', () => {
    const payload = {
      safe: 'kept',
      toJSON() {
        return { email: 'person@example.com' };
      },
    };

    const sanitized = sanitizeLogFields({ payload }, { sensitiveKeys });

    expect(sanitized.payload).toEqual({ email: '[REDACTED]' });
    expect(sanitized.payload).not.toBe(payload);
    expect(JSON.stringify(sanitized)).not.toContain('person@example.com');
  });

  it('serializes and sanitizes array subclasses with toJSON methods to prevent bypass', () => {
    class SecretList extends Array<string> {
      toJSON() {
        return { email: 'person@example.com' };
      }
    }

    const list = new SecretList('safe');
    const sanitized = sanitizeLogFields({ list }, { sensitiveKeys });

    expect(sanitized.list).toEqual({ email: '[REDACTED]' });
    expect(sanitized.list).not.toBe(list);
    expect(JSON.stringify(sanitized)).not.toContain('person@example.com');
  });

  it('does not leak toJSON objects into sibling branches after serialization', () => {
    class SecretPayload {
      toJSON() {
        return { email: 'person@example.com' };
      }
    }

    const payload = new SecretPayload();

    expect(
      sanitizeLogFields({ first: payload, second: payload }, { sensitiveKeys })
    ).toEqual({
      first: { email: '[REDACTED]' },
      second: { email: '[REDACTED]' },
    });
  });

  it('falls back when non-plain object serialization throws', () => {
    class BrokenPayload {
      toJSON() {
        throw new Error('boom');
      }
    }

    expect(
      sanitizeLogFields({ payload: new BrokenPayload() }, { sensitiveKeys })
    ).toEqual({
      payload: '[NonPlainObject]',
    });
  });

  it('marks non-plain empty objects that cannot be serialized safely', () => {
    class EmptyPayload {}

    expect(
      sanitizeLogFields({ payload: new EmptyPayload() }, { sensitiveKeys })
    ).toEqual({
      payload: '[NonPlainObject]',
    });
  });

  it('preserves empty plain objects and objects without prototypes', () => {
    const nullPrototypeObject = Object.create(null) as Record<string, unknown>;
    nullPrototypeObject.email = 'person@example.com';

    expect(
      sanitizeLogFields(
        {
          empty: {},
          nullPrototypeObject,
        },
        { sensitiveKeys }
      )
    ).toEqual({
      empty: {},
      nullPrototypeObject: {
        email: '[REDACTED]',
      },
    });
  });

  it('preserves sparse array holes while sanitizing entries', () => {
    const list: Array<string | undefined> = [];
    list.length = 3;
    list[0] = 'safe';
    list[2] = 'person@example.com';

    const sanitized = sanitizeLogFields({ list }, { sensitiveKeys });
    const sanitizedList = sanitized.list as unknown[];

    expect(Array.isArray(sanitizedList)).toBe(true);
    expect(sanitizedList).toHaveLength(3);
    expect(1 in sanitizedList).toBe(false);
    expect(sanitizedList[0]).toBe('safe');
    expect(sanitizedList[2]).toBe('[REDACTED]');
  });

  it('compacts oversized sparse arrays without walking their declared length', () => {
    const list: Array<string | undefined> = [];
    list.length = 1_000_000_000;
    list[0] = 'safe';
    list[999_999_999] = 'person@example.com';

    expect(sanitizeLogFields({ list }, { sensitiveKeys })).toEqual({
      list: {
        type: '[OversizedArray]',
        length: 1_000_000_000,
        entries: {
          '0': 'safe',
          '999999999': '[REDACTED]',
        },
        truncatedEntries: 0,
      },
    });
  });

  it('compacts oversized dense arrays without collecting every array key', () => {
    const list = Array.from({ length: 10_001 }, (_, index) => `safe-${index}`);
    list[0] = 'person@example.com';
    const sanitized = sanitizeLogFieldsWithObjectKeysGuard({ list });

    const sanitizedList = sanitized.list as {
      entries: Record<string, unknown>;
      length: number;
      truncatedEntries: number;
      type: string;
    };

    expect(sanitizedList.type).toBe('[OversizedArray]');
    expect(sanitizedList.length).toBe(10_001);
    expect(Object.keys(sanitizedList.entries)).toHaveLength(1_000);
    expect(sanitizedList.entries['0']).toBe('[REDACTED]');
    expect(sanitizedList.entries['999']).toBe('safe-999');
    expect(sanitizedList.truncatedEntries).toBe(9_001);
  });

  it('sanitizes array entries without calling an overridden map method', () => {
    const list = ['safe', 'person@example.com'];
    Object.defineProperty(list, 'map', {
      value: () => ['person@example.com'],
    });

    const sanitized = sanitizeLogFields({ list }, { sensitiveKeys });

    expect(sanitized.list).toEqual(['safe', '[REDACTED]']);
    expect(JSON.stringify(sanitized)).not.toContain('person@example.com');
  });

  it('sanitizes array entries without treating the item slot as a sensitive key', () => {
    const sanitized = sanitizeLogFields(
      {
        list: ['safe'],
      },
      { sensitiveKeys: new Set(['list', 'Stryker was here!']) }
    );

    expect(sanitized.list).toBe('[REDACTED]');

    const nested = sanitizeLogFields(
      {
        list: [['safe']],
      },
      { sensitiveKeys: new Set(['Stryker was here!']) }
    );

    expect(nested.list).toEqual([['safe']]);
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

  test.prop([sensitiveKeyVariant, redactionText], PROPERTY_DEFAULTS)(
    'redacts generated sensitive keys regardless of casing',
    (key, value) => {
      expect(sanitizeLogFields({ [key]: value }, { sensitiveKeys })).toEqual({
        [key]: '[REDACTED]',
      });
    }
  );

  test.prop(
    [redactionText, fc.emailAddress(), redactionText],
    PROPERTY_DEFAULTS
  )(
    'redacts generated email-shaped strings inside messages',
    (before, email, after) => {
      expect(
        sanitizeLogFields(
          { message: `${before} ${email} ${after}` },
          { sensitiveKeys }
        )
      ).toEqual({
        message: `${before} [REDACTED] ${after}`,
      });
    }
  );

  test.prop([fc.emailAddress(), secretValue], PROPERTY_DEFAULTS)(
    'does not leak generated nested sensitive values after serialization',
    (email, secret) => {
      const sanitized = sanitizeLogFields(
        {
          nested: {
            list: [{ message: `Contact ${email}` }, { name: secret }],
            object: {
              phone: secret,
              user: { email },
            },
          },
        },
        { sensitiveKeys }
      );
      const serialized = JSON.stringify(sanitized);

      expect(serialized).toContain('[REDACTED]');
      expect(serialized).not.toContain(email);
      expect(serialized).not.toContain(secret);
    }
  );
});
