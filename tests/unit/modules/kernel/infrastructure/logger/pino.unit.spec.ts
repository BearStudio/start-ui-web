import { describe, expect, it, vi } from 'vitest';

import {
  createRequestLogger,
  type Logger,
} from '@/modules/kernel/application/ports/logger';
import {
  toCorrelationId,
  toRequestId,
  toUserId,
} from '@/modules/kernel/domain/ids';
import { createPinoAppLogger } from '@/modules/kernel/infrastructure/logger/pino';
import type { TelemetryAdapter } from '@/platform/telemetry';

vi.unmock('@/modules/kernel/infrastructure/logger/pino');

const makeTelemetry = (): TelemetryAdapter => ({
  captureException: vi.fn(),
  setUser: vi.fn(),
  startSpan: vi.fn((_options, fn) => fn()),
});

const makePino = () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
});

describe('createPinoAppLogger', () => {
  it('writes sanitized structured fields with the event as the message', () => {
    const pino = makePino();
    const telemetry = makeTelemetry();
    const logger = createPinoAppLogger({
      pino,
      telemetry,
      defaultFields: { requestId: toRequestId('request-1') },
    });
    const fields = {
      event: 'email.send.failed',
      details: {
        email: 'person@example.com',
        nested: { token: 'secret-token' },
      },
      sentryTags: { provider: 'resend' },
      sentryExtras: { statusCode: 401 },
    };

    logger.error(fields);

    expect(pino.error).toHaveBeenCalledWith(
      {
        event: 'email.send.failed',
        requestId: 'request-1',
        details: {
          email: '[REDACTED]',
          nested: { token: '[REDACTED]' },
        },
      },
      'email.send.failed'
    );
    expect(fields.details.email).toBe('person@example.com');
    expect(fields.details.nested.token).toBe('secret-token');
    expect(telemetry.captureException).not.toHaveBeenCalled();
  });

  it('captures provided exceptions once with sanitized Sentry context', () => {
    const pino = makePino();
    const telemetry = makeTelemetry();
    const logger = createPinoAppLogger({ pino, telemetry });
    const exception = new Error('Resend rejected person@example.com');

    logger.error({
      event: 'email.send.failed',
      requestId: toRequestId('request-1'),
      correlationId: toCorrelationId('correlation-1'),
      error: 'Provider rejected person@example.com',
      exception,
      details: {
        authorization: 'Bearer token',
      },
      sentryTags: {
        attempt: 2,
        email: 'person@example.com',
        provider: 'resend',
        retryable: false,
      },
      sentryExtras: {
        email: 'person@example.com',
        statusCode: 401,
      },
    });

    expect(pino.error).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Provider rejected [REDACTED]',
        exception: expect.objectContaining({
          message: 'Resend rejected [REDACTED]',
          type: 'Error',
        }),
      }),
      'email.send.failed'
    );
    expect(telemetry.captureException).toHaveBeenCalledTimes(1);
    expect(telemetry.captureException).toHaveBeenCalledWith(exception, {
      tags: {
        correlationId: 'correlation-1',
        attempt: '2',
        email: '[REDACTED]',
        event: 'email.send.failed',
        provider: 'resend',
        requestId: 'request-1',
        retryable: 'false',
      },
      extra: {
        email: '[REDACTED]',
        statusCode: 401,
        log: expect.objectContaining({
          details: {
            authorization: '[REDACTED]',
          },
          exception: expect.objectContaining({
            message: 'Resend rejected [REDACTED]',
            type: 'Error',
          }),
        }),
      },
      level: 'error',
    });
  });

  it('does not invent exceptions for error logs without one', () => {
    const pino = makePino();
    const telemetry = makeTelemetry();
    const logger = createPinoAppLogger({ pino, telemetry });

    logger.error({
      event: 'email.send.failed',
      error: 'Provider rejected the send',
    });

    expect(pino.error).toHaveBeenCalledTimes(1);
    expect(telemetry.captureException).not.toHaveBeenCalled();
  });

  it('handles circular details and oversized arrays without crashing', () => {
    const pino = makePino();
    const logger = createPinoAppLogger({
      pino,
      telemetry: makeTelemetry(),
    });
    const payload: Record<string, unknown> = {};
    payload.self = payload;
    const list = Array.from({ length: 10_001 }, (_, index) => index);

    logger.info({
      event: 'payload.inspect',
      details: {
        list,
        payload,
      },
    });

    expect(pino.info).toHaveBeenCalledWith(
      {
        event: 'payload.inspect',
        details: {
          list: expect.objectContaining({
            length: 10_001,
            truncatedEntries: 9_001,
            type: '[OversizedArray]',
          }),
          payload: {
            self: '[Circular]',
          },
        },
      },
      'payload.inspect'
    );
  });

  it('adds request context and prevents caller fields from overriding it', () => {
    const logger: Logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    const requestLogger = createRequestLogger({
      logger,
      requestId: toRequestId('request-1'),
      userId: toUserId('actor-1'),
    });

    requestLogger.info({
      event: 'user.update',
      requestId: toRequestId('caller-request'),
      userId: toUserId('target-1'),
      details: { userId: 'target-1' },
    });

    expect(logger.info).toHaveBeenCalledWith({
      event: 'user.update',
      requestId: 'request-1',
      userId: 'actor-1',
      details: { userId: 'target-1' },
    });
  });
});
