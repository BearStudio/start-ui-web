import { describe, expect, it } from 'vitest';

import { fc, PROPERTY_DEFAULTS, test } from '@/tests/support/property-testing';

import {
  EMAIL_PROVIDER_RESEND,
  type EmailStatusRecord,
  hasProcessedWebhookEvent,
  withProcessedWebhookEventId,
} from './email-status';

const now = new Date('2026-01-01T00:00:00.000Z');
const eventId = fc.stringMatching(/^evt_[a-z0-9]{1,12}$/);

function makeRecord(
  overrides: Partial<EmailStatusRecord> = {}
): EmailStatusRecord {
  return {
    id: 'email-status-1',
    provider: EMAIL_PROVIDER_RESEND,
    externalId: 'email_123',
    recipient: 'user@example.com',
    subject: 'Login code',
    status: 'sent',
    idempotencyKey: null,
    lastWebhookEventId: null,
    metadata: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('email status domain', () => {
  it('detects webhook events from the latest event field and processed metadata', () => {
    const record = makeRecord({
      lastWebhookEventId: 'evt_latest',
      metadata: {
        processedWebhookEventIds: ['evt_older', 123, 'evt_oldest'],
      },
    });

    expect(hasProcessedWebhookEvent(record, 'evt_latest')).toBe(true);
    expect(hasProcessedWebhookEvent(record, 'evt_older')).toBe(true);
    expect(hasProcessedWebhookEvent(record, 'evt_missing')).toBe(false);
  });

  it('preserves metadata while deduping and bounding processed webhook IDs', () => {
    expect(
      withProcessedWebhookEventId(
        {
          campaign: 'login',
          processedWebhookEventIds: ['evt_1', 'evt_2', 'evt_2'],
        },
        'evt_2'
      )
    ).toEqual({
      campaign: 'login',
      processedWebhookEventIds: ['evt_1', 'evt_2'],
    });

    expect(
      withProcessedWebhookEventId(
        { processedWebhookEventIds: ['evt_1', 'evt_2', 'evt_3'] },
        'evt_4',
        2
      )
    ).toEqual({
      processedWebhookEventIds: ['evt_3', 'evt_4'],
    });
  });

  test.prop(
    [
      fc.array(eventId, { maxLength: 30 }),
      eventId,
      fc.integer({ min: 1, max: 10 }),
    ],
    PROPERTY_DEFAULTS
  )(
    'keeps generated processed webhook ID metadata bounded',
    (ids, id, limit) => {
      const metadata = withProcessedWebhookEventId(
        { processedWebhookEventIds: ids },
        id,
        limit
      );
      const processedIds = metadata.processedWebhookEventIds;

      expect(Array.isArray(processedIds)).toBe(true);

      const processedWebhookEventIds = processedIds as string[];

      expect(processedWebhookEventIds.length).toBeLessThanOrEqual(limit);
      expect(processedWebhookEventIds.at(-1)).toBe(id);
      expect(
        processedWebhookEventIds.filter((processedId) => processedId === id)
      ).toHaveLength(1);
    }
  );
});
