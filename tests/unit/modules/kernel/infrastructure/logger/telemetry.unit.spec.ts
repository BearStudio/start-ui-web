import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createRequestLogger,
  type Logger,
} from '@/modules/kernel/application/ports/logger';
import {
  toCorrelationId,
  toRequestId,
  toUserId,
} from '@/modules/kernel/domain/ids';
import { createTelemetryLogger } from '@/modules/kernel/infrastructure/logger/telemetry';
import {
  createNoOpTelemetry,
  type TelemetryAdapter,
  type TelemetryCorrelation,
} from '@/platform/telemetry';

vi.unmock('@/modules/kernel/infrastructure/logger/telemetry');

const makeTelemetry = (
  correlation: TelemetryCorrelation = {}
): TelemetryAdapter => ({
  ...createNoOpTelemetry(),
  captureException: vi.fn(),
  currentCorrelation: vi.fn(() => correlation),
  emitLog: vi.fn(),
  setUser: vi.fn(),
  startSpan: vi.fn((_options, fn) => fn()),
});

describe('createTelemetryLogger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('emits sanitized structured OTel logs with the event as the message', () => {
    const telemetry = makeTelemetry();
    const logger = createTelemetryLogger({
      telemetry,
      consoleMirror: false,
      defaultFields: { requestId: toRequestId('request-1') },
      level: 'debug',
    });
    const fields = {
      event: 'email.send.failed',
      details: {
        email: 'person@example.com',
        nested: { token: 'secret-token' },
      },
      telemetryExtras: { statusCode: 401 },
      telemetryTags: { provider: 'resend' },
    };

    logger.error(fields);

    expect(telemetry.emitLog).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: { requestId: 'request-1' },
        details: {
          email: '[REDACTED]',
          nested: { token: '[REDACTED]' },
        },
        event: 'email.send.failed',
        level: 'error',
        message: 'email.send.failed',
      })
    );
    expect(fields.details.email).toBe('person@example.com');
    expect(fields.details.nested.token).toBe('secret-token');
    expect(telemetry.captureException).not.toHaveBeenCalled();
  });

  it('captures provided exceptions once with sanitized telemetry context and trace correlation', () => {
    const telemetry = makeTelemetry({ spanId: 'span-1', traceId: 'trace-1' });
    const logger = createTelemetryLogger({
      telemetry,
      consoleMirror: false,
      level: 'debug',
    });
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
      telemetryExtras: {
        email: 'person@example.com',
        statusCode: 401,
      },
      telemetryTags: {
        attempt: 2,
        email: 'person@example.com',
        provider: 'resend',
        retryable: false,
      },
    });

    expect(telemetry.emitLog).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          correlationId: 'correlation-1',
          requestId: 'request-1',
          spanId: 'span-1',
          traceId: 'trace-1',
        }),
        error: 'Provider rejected [REDACTED]',
        event: 'email.send.failed',
        exception,
      })
    );
    expect(telemetry.captureException).toHaveBeenCalledTimes(1);
    expect(telemetry.captureException).toHaveBeenCalledWith(exception, {
      tags: {
        attempt: '2',
        correlationId: 'correlation-1',
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
          spanId: 'span-1',
          traceId: 'trace-1',
        }),
      },
      level: 'error',
    });
  });

  it('does not invent exceptions for error logs without one', () => {
    const telemetry = makeTelemetry();
    const logger = createTelemetryLogger({
      telemetry,
      consoleMirror: false,
      level: 'debug',
    });

    logger.error({
      event: 'email.send.failed',
      error: 'Provider rejected the send',
    });

    expect(telemetry.emitLog).toHaveBeenCalledTimes(1);
    expect(telemetry.captureException).not.toHaveBeenCalled();
  });

  it('applies LOGGER_LEVEL-style filtering before emitting logs or console mirrors', () => {
    const telemetry = makeTelemetry();
    const infoSpy = vi
      .spyOn(globalThis.console, 'info')
      .mockImplementation(() => undefined);
    const warnSpy = vi
      .spyOn(globalThis.console, 'warn')
      .mockImplementation(() => undefined);
    const logger = createTelemetryLogger({
      telemetry,
      consoleMirror: true,
      level: 'warn',
    });

    logger.info({ event: 'filtered.info' });
    logger.warn({ event: 'visible.warn' });

    expect(telemetry.emitLog).toHaveBeenCalledTimes(1);
    expect(telemetry.emitLog).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'visible.warn',
        level: 'warn',
      })
    );
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('mirrors sanitized structured logs to the console when enabled', () => {
    const telemetry = makeTelemetry();
    const infoSpy = vi
      .spyOn(globalThis.console, 'info')
      .mockImplementation(() => undefined);
    const logger = createTelemetryLogger({
      telemetry,
      consoleMirror: true,
      level: 'debug',
    });

    logger.info({
      event: 'profile.loaded',
      details: { email: 'person@example.com' },
    });

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(infoSpy.mock.calls[0]?.[0]))).toEqual({
      level: 'info',
      message: 'profile.loaded',
      event: 'profile.loaded',
      details: { email: '[REDACTED]' },
    });
  });

  it('handles circular details and oversized arrays without crashing', () => {
    const telemetry = makeTelemetry();
    const logger = createTelemetryLogger({
      telemetry,
      consoleMirror: false,
      level: 'debug',
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

    expect(telemetry.emitLog).toHaveBeenCalledWith(
      expect.objectContaining({
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
      })
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
