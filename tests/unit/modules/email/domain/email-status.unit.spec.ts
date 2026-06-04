import { fc, PROPERTY_DEFAULTS, test } from '@tests/support/property-testing';
import { describe, expect, it } from 'vitest';

import {
  EMAIL_PROVIDER_RESEND,
  type EmailStatusRecord,
  hasProcessedWebhookEvent,
  withProcessedWebhookEventId,
} from '@/modules/email/domain/email-status';
import {
  toEmailProviderMessageId,
  toEmailRecipientList,
  toEmailStatusId,
  toEmailWebhookEventId,
} from '@/modules/kernel/domain/ids';

const now = new Date('2026-01-01T00:00:00.000Z');
const eventId = fc
  .stringMatching(/^evt_[a-z0-9]{1,12}$/)
  .map(toEmailWebhookEventId);

function makeRecord(
  overrides: Partial<EmailStatusRecord> = {}
): EmailStatusRecord {
  return {
    id: toEmailStatusId('email-status-1'),
    provider: EMAIL_PROVIDER_RESEND,
    externalId: toEmailProviderMessageId('email_123'),
    recipient: toEmailRecipientList('user@example.com'),
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
      lastWebhookEventId: toEmailWebhookEventId('evt_latest'),
      metadata: {
        processedWebhookEventIds: ['evt_older', 123, 'evt_oldest'],
      },
    });

    expect(
      hasProcessedWebhookEvent(record, toEmailWebhookEventId('evt_latest'))
    ).toBe(true);
    expect(
      hasProcessedWebhookEvent(record, toEmailWebhookEventId('evt_older'))
    ).toBe(true);
    expect(
      hasProcessedWebhookEvent(record, toEmailWebhookEventId('evt_missing'))
    ).toBe(false);
  });

  it('preserves metadata while deduping and bounding processed webhook IDs', () => {
    expect(
      withProcessedWebhookEventId(
        {
          campaign: 'login',
          processedWebhookEventIds: ['evt_1', 'evt_2', 'evt_2'],
        },
        toEmailWebhookEventId('evt_2')
      )
    ).toEqual({
      campaign: 'login',
      processedWebhookEventIds: ['evt_1', 'evt_2'],
    });

    expect(
      withProcessedWebhookEventId(
        { processedWebhookEventIds: ['evt_1', 'evt_2', 'evt_3'] },
        toEmailWebhookEventId('evt_4'),
        2
      )
    ).toEqual({
      processedWebhookEventIds: ['evt_3', 'evt_4'],
    });

    expect(
      withProcessedWebhookEventId(
        { processedWebhookEventIds: ['evt_1', 'evt_2'] },
        toEmailWebhookEventId('evt_3'),
        0
      )
    ).toEqual({
      processedWebhookEventIds: [],
    });
  });

  it('falls back to the default processed webhook ID limit for invalid limits', () => {
    const ids = Array.from({ length: 25 }, (_, index) => `evt_${index}`);

    for (const limit of [Number.POSITIVE_INFINITY, Number.NaN, -1]) {
      const metadata = withProcessedWebhookEventId(
        { processedWebhookEventIds: ids },
        toEmailWebhookEventId('evt_new'),
        limit
      );

      expect(metadata.processedWebhookEventIds).toHaveLength(20);
      expect(metadata.processedWebhookEventIds).toContain('evt_new');
    }
  });

  test.prop(
    [
      fc.array(eventId, { maxLength: 30 }),
      eventId,
      fc.integer({ min: 0, max: 10 }),
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

      if (limit === 0) {
        expect(processedWebhookEventIds).toHaveLength(0);
      } else {
        expect(processedWebhookEventIds.at(-1)).toBe(id);
        expect(
          processedWebhookEventIds.filter((processedId) => processedId === id)
        ).toHaveLength(1);
      }
    }
  );
});
