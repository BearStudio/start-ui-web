import { describe, expect, it, vi } from 'vitest';

import { AppError } from '@/modules/kernel/domain/errors/app-error';

import { createResendWebhookHandlers } from './resend-webhook-handlers';

const makeRequest = (body = 'raw-body', headers?: HeadersInit) =>
  new Request('https://example.test/api/webhooks/resend', {
    method: 'POST',
    body,
    headers: {
      'svix-id': 'evt_1',
      'svix-timestamp': '1704067200',
      'svix-signature': 'sig_1',
      ...headers,
    },
  });

const makeEmailEvent = (type = 'email.delivered') =>
  ({
    type,
    created_at: '2026-01-01T00:00:00.000Z',
    data: {
      email_id: 'email_123',
      created_at: '2026-01-01T00:00:00.000Z',
      from: 'noreply@example.com',
      to: ['user@example.com'],
      subject: 'Login code',
    },
  }) as ExplicitAny;

describe('Resend webhook HTTP handlers', () => {
  it('passes the raw request body and Svix headers to the verifier', async () => {
    const processStatusEvent = vi.fn(async () => ({
      duplicate: false,
      record: {} as ExplicitAny,
    }));
    const verifier = {
      verify: vi.fn(() => makeEmailEvent()),
    };
    const handlers = createResendWebhookHandlers({
      getUseCases: () => ({ processStatusEvent }),
      verifier,
    });

    await handlers.receive(makeRequest('{"type":"email.delivered"}'));

    expect(verifier.verify).toHaveBeenCalledWith({
      payload: '{"type":"email.delivered"}',
      headers: {
        id: 'evt_1',
        timestamp: '1704067200',
        signature: 'sig_1',
      },
    });
  });

  it('rejects requests missing Svix signature headers', async () => {
    const handlers = createResendWebhookHandlers({
      getUseCases: () => ({ processStatusEvent: vi.fn() }),
      verifier: { verify: vi.fn() },
    });

    await expect(
      handlers.receive(
        new Request('https://example.test/api/webhooks/resend', {
          method: 'POST',
          body: 'raw-body',
        })
      )
    ).rejects.toMatchObject({
      code: 'EMAIL_WEBHOOK_MISSING_HEADER',
      status: 400,
      details: { header: 'svix-id' },
    });
  });

  it('surfaces invalid signature errors from the verifier', async () => {
    const handlers = createResendWebhookHandlers({
      getUseCases: () => ({ processStatusEvent: vi.fn() }),
      verifier: {
        verify: vi.fn(() => {
          throw new AppError({
            code: 'EMAIL_WEBHOOK_INVALID_SIGNATURE',
            category: 'bad_request',
            status: 400,
            message: 'Invalid email webhook signature',
          });
        }),
      },
    });

    await expect(handlers.receive(makeRequest())).rejects.toMatchObject({
      code: 'EMAIL_WEBHOOK_INVALID_SIGNATURE',
      status: 400,
    });
  });

  it('ignores non-email webhook events with a successful response', async () => {
    const processStatusEvent = vi.fn();
    const handlers = createResendWebhookHandlers({
      getUseCases: () => ({ processStatusEvent }),
      verifier: {
        verify: vi.fn(
          () =>
            ({
              type: 'contact.created',
              created_at: '2026-01-01T00:00:00.000Z',
              data: {
                id: 'contact_123',
                audience_id: 'aud_123',
                segment_ids: [],
                created_at: '2026-01-01T00:00:00.000Z',
                updated_at: '2026-01-01T00:00:00.000Z',
                email: 'user@example.com',
                unsubscribed: false,
              },
            }) as ExplicitAny
        ),
      },
    });

    const response = await handlers.receive(makeRequest());

    await expect(response.json()).resolves.toEqual({
      ok: true,
      ignored: true,
    });
    expect(processStatusEvent).not.toHaveBeenCalled();
  });

  it('maps email events to status upserts by Resend email ID', async () => {
    const processStatusEvent = vi.fn(async () => ({
      duplicate: false,
      record: {} as ExplicitAny,
    }));
    const event = makeEmailEvent('email.delivered');
    const handlers = createResendWebhookHandlers({
      getUseCases: () => ({ processStatusEvent }),
      verifier: { verify: vi.fn(() => event) },
    });

    const response = await handlers.receive(makeRequest());

    await expect(response.json()).resolves.toEqual({
      ok: true,
      duplicate: false,
    });
    expect(processStatusEvent).toHaveBeenCalledWith({
      provider: 'resend',
      externalId: 'email_123',
      recipient: 'user@example.com',
      subject: 'Login code',
      status: 'delivered',
      webhookEventId: 'evt_1',
      providerEventType: 'email.delivered',
      providerEventCreatedAt: '2026-01-01T00:00:00.000Z',
      metadata: {
        resendEvent: event,
      },
    });
  });

  it('returns duplicate status when the use case dedupes a webhook event ID', async () => {
    const processStatusEvent = vi.fn(async () => ({
      duplicate: true,
      record: {} as ExplicitAny,
    }));
    const handlers = createResendWebhookHandlers({
      getUseCases: () => ({ processStatusEvent }),
      verifier: { verify: vi.fn(() => makeEmailEvent()) },
    });

    const response = await handlers.receive(makeRequest());

    await expect(response.json()).resolves.toEqual({
      ok: true,
      duplicate: true,
    });
  });
});
