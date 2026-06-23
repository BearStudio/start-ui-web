import { Result } from '@swan-io/boxed';
import { describe, expect, it, vi } from 'vitest';

import { createResendWebhookHandlers } from '@/modules/email/transport/http/resend-webhook-handlers';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import {
  toEmailProviderMessageId,
  toEmailRecipientList,
  toEmailWebhookEventId,
} from '@/modules/kernel/domain/ids';

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

const makeStreamingRequest = (
  body: ReadableStream<Uint8Array>,
  headers?: HeadersInit
) =>
  new Request('https://example.test/api/webhooks/resend', {
    method: 'POST',
    body,
    headers: {
      'svix-id': 'evt_1',
      'svix-timestamp': '1704067200',
      'svix-signature': 'sig_1',
      ...headers,
    },
    duplex: 'half',
  } as RequestInit & { duplex: 'half' });

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
  it('passes the raw request body and Resend SDK header shape to the verifier', async () => {
    const processStatusEvent = vi.fn(async () =>
      Result.Ok({
        type: 'email_status_event_processed' as const,
        record: {} as ExplicitAny,
      })
    );
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

  it('rejects requests missing Svix signature headers before reading the body', async () => {
    const request = new Request('https://example.test/api/webhooks/resend', {
      method: 'POST',
      body: 'raw-body',
    });
    const getReader = vi.spyOn(request.body!, 'getReader');
    const handlers = createResendWebhookHandlers({
      getUseCases: () => ({ processStatusEvent: vi.fn() }),
      verifier: { verify: vi.fn() },
    });

    await expect(handlers.receive(request)).rejects.toMatchObject({
      code: 'EMAIL_WEBHOOK_MISSING_HEADER',
      status: 400,
      details: { header: 'svix-id' },
    });
    expect(getReader).not.toHaveBeenCalled();
  });

  it('rejects requests whose Content-Length is over the webhook byte limit', async () => {
    const verifier = { verify: vi.fn() };
    const handlers = createResendWebhookHandlers({
      getUseCases: () => ({ processStatusEvent: vi.fn() }),
      maxBodyBytes: 3,
      verifier,
    });

    await expect(
      handlers.receive(makeRequest('raw-body', { 'Content-Length': '4' }))
    ).rejects.toMatchObject({
      code: 'EMAIL_WEBHOOK_PAYLOAD_TOO_LARGE',
      status: 413,
      details: { maxBytes: 3 },
    });
    expect(verifier.verify).not.toHaveBeenCalled();
  });

  it('rejects streamed webhook bodies as soon as the byte limit is exceeded', async () => {
    let canceled = false;
    let chunkCount = 0;
    const verifier = { verify: vi.fn() };
    const body = new ReadableStream<Uint8Array>({
      cancel() {
        canceled = true;
      },
      pull(controller) {
        chunkCount += 1;
        controller.enqueue(new Uint8Array([chunkCount, chunkCount]));
      },
    });
    const handlers = createResendWebhookHandlers({
      getUseCases: () => ({ processStatusEvent: vi.fn() }),
      maxBodyBytes: 3,
      verifier,
    });

    await expect(
      handlers.receive(
        makeStreamingRequest(body, {
          'Content-Length': '1',
        })
      )
    ).rejects.toMatchObject({
      code: 'EMAIL_WEBHOOK_PAYLOAD_TOO_LARGE',
      status: 413,
      details: { maxBytes: 3 },
    });
    expect(verifier.verify).not.toHaveBeenCalled();
    expect(canceled).toBe(true);
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

  it('logs a warning when signature verification fails', async () => {
    const logger = { warn: vi.fn() };
    const verifyError = new Error('Invalid signature');
    const handlers = createResendWebhookHandlers({
      getUseCases: () => ({ processStatusEvent: vi.fn() }),
      logger,
      verifier: {
        verify: vi.fn(() => {
          throw verifyError;
        }),
      },
    });

    await expect(handlers.receive(makeRequest())).rejects.toThrow(
      'Invalid signature'
    );

    expect(logger.warn).toHaveBeenCalledWith({
      details: {
        provider: 'resend',
        reason: 'Invalid signature',
      },
      event: 'security.webhook_signature_rejected',
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
    const processStatusEvent = vi.fn(async () =>
      Result.Ok({
        type: 'email_status_event_processed' as const,
        record: {} as ExplicitAny,
      })
    );
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
      externalId: toEmailProviderMessageId('email_123'),
      recipient: toEmailRecipientList('user@example.com'),
      subject: 'Login code',
      status: 'delivered',
      webhookEventId: toEmailWebhookEventId('evt_1'),
      providerEventType: 'email.delivered',
      providerEventCreatedAt: '2026-01-01T00:00:00.000Z',
      metadata: {
        resendEvent: event,
      },
    });
  });

  it('returns duplicate status when the use case dedupes a webhook event ID', async () => {
    const processStatusEvent = vi.fn(async () =>
      Result.Ok({
        type: 'email_status_event_duplicate' as const,
        record: {} as ExplicitAny,
      })
    );
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
