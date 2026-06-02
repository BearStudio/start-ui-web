import { sanitizeLogFields } from '@/platform/lib/redaction/sanitize-log-fields';

import { getKernel } from '@/composition/kernel';
import { getTelemetryConfig } from '@/modules/kernel/infrastructure/config/telemetry';
import {
  appendBrowserMutationVaryHeader,
  validateSameOriginBrowserMutationRequest,
} from '@/platform/http/browser-mutation-protection';
import type { TelemetryLogLevel } from '@/platform/telemetry';
import { getTelemetry } from '@/platform/telemetry';

import { recordLocalTelemetrySummary } from './local-sqlite-sink';

type OtlpSignal = 'metrics' | 'traces';

type FrontendLogRecord = {
  level: TelemetryLogLevel;
  event: string;
  message?: string;
  details?: Record<string, unknown>;
  error?: string;
  traceId?: string;
  spanId?: string;
  timestamp?: string;
};

const OTLP_CONTENT_TYPES = new Set([
  'application/x-protobuf',
  'application/octet-stream',
]);
const SENTRY_ENVELOPE_CONTENT_TYPES = new Set([
  'application/octet-stream',
  'application/x-sentry-envelope',
  'text/plain',
]);

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const signalUrl = (collectorUrl: string, signal: OtlpSignal | 'logs') =>
  `${trimTrailingSlash(collectorUrl)}/v1/${signal}`;

const contentType = (request: Request) =>
  request.headers.get('Content-Type')?.split(';')[0]?.trim().toLowerCase() ??
  '';

const forbidden = (reason: string) =>
  new Response(JSON.stringify({ error: 'forbidden', reason }), {
    headers: { 'Content-Type': 'application/json' },
    status: 403,
  });

const unsupportedMediaType = () =>
  new Response(JSON.stringify({ error: 'unsupported_media_type' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 415,
  });

const payloadTooLarge = () =>
  new Response(JSON.stringify({ error: 'payload_too_large' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 413,
  });

const badRequest = () =>
  new Response(JSON.stringify({ error: 'invalid_request_body' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 400,
  });

const tooManyEvents = () =>
  new Response(JSON.stringify({ error: 'too_many_events' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 413,
  });

const accepted = () => new Response(null, { status: 202 });
const noContent = () => new Response(null, { status: 204 });

const withTelemetryVary = (response: Response) =>
  appendBrowserMutationVaryHeader(response);

const validateTelemetryMutationRequest = (
  request: Request,
  allowedContentTypes: ReadonlySet<string>
) => {
  const sameOrigin = validateSameOriginBrowserMutationRequest(request);
  if (!sameOrigin.ok) {
    return withTelemetryVary(forbidden(sameOrigin.reason));
  }

  if (!allowedContentTypes.has(contentType(request))) {
    return withTelemetryVary(unsupportedMediaType());
  }

  return undefined;
};

const readBoundedBody = async (request: Request) => {
  const config = getTelemetryConfig();
  const contentLength = Number(request.headers.get('Content-Length') ?? '0');
  if (Number.isFinite(contentLength) && contentLength > config.proxyMaxBytes) {
    return { ok: false as const, response: payloadTooLarge() };
  }

  if (!request.body) {
    return { ok: true as const, body: new ArrayBuffer(0) };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > config.proxyMaxBytes) {
        await reader.cancel();
        return { ok: false as const, response: payloadTooLarge() };
      }

      chunks.push(value);
    }
  } catch {
    return { ok: false as const, response: badRequest() };
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { ok: true as const, body: body.buffer };
};

const forwardToCollector = async (
  signal: OtlpSignal,
  body: ArrayBuffer,
  requestContentType: string
) => {
  const config = getTelemetryConfig();
  if (!config.collectorUrl) {
    recordLocalTelemetrySummary({
      bytes: body.byteLength,
      kind: 'otlp_proxy',
      signal,
      statusCode: 204,
      summary: { forwarded: false, reason: 'missing_collector_env' },
    });
    return noContent();
  }

  const headers: Record<string, string> = {
    'Content-Type': requestContentType,
    ...(config.collectorBearerToken
      ? { Authorization: `Bearer ${config.collectorBearerToken}` }
      : {}),
  };
  const collectorResponse = await fetch(
    signalUrl(config.collectorUrl, signal),
    {
      body,
      headers,
      method: 'POST',
    }
  );
  const status = collectorResponse.ok ? 202 : 502;

  recordLocalTelemetrySummary({
    bytes: body.byteLength,
    kind: 'otlp_proxy',
    signal,
    statusCode: status,
    summary: { collectorStatus: collectorResponse.status, forwarded: true },
  });

  return new Response(null, { status });
};

const sentryEnvelopeEndpoint = (dsn: string) => {
  const parsed = new URL(dsn);
  const projectId = parsed.pathname.split('/').filter(Boolean).at(-1);
  if (!projectId) return undefined;

  return `${parsed.origin}/api/${projectId}/envelope/`;
};

const forwardSentryEnvelope = async (body: ArrayBuffer) => {
  const config = getTelemetryConfig();
  const endpoint = config.browserDsn
    ? sentryEnvelopeEndpoint(config.browserDsn)
    : undefined;
  if (!endpoint) {
    recordLocalTelemetrySummary({
      bytes: body.byteLength,
      kind: 'sentry_tunnel',
      statusCode: 204,
      summary: { forwarded: false, reason: 'missing_sentry_dsn' },
    });
    return noContent();
  }

  const sentryResponse = await fetch(endpoint, {
    body,
    headers: { 'Content-Type': 'application/x-sentry-envelope' },
    method: 'POST',
  });
  const status = sentryResponse.ok ? 202 : 502;

  recordLocalTelemetrySummary({
    bytes: body.byteLength,
    kind: 'sentry_tunnel',
    statusCode: status,
    summary: { forwarded: true, sentryStatus: sentryResponse.status },
  });

  return new Response(null, { status });
};

export const handleOtlpProxyRequest = async (
  request: Request,
  signal: OtlpSignal
) => {
  const invalid = validateTelemetryMutationRequest(request, OTLP_CONTENT_TYPES);
  if (invalid) return invalid;

  const body = await readBoundedBody(request);
  if (!body.ok) return withTelemetryVary(body.response);

  return withTelemetryVary(
    await forwardToCollector(signal, body.body, contentType(request))
  );
};

export const handleSentryTunnelRequest = async (request: Request) => {
  const invalid = validateTelemetryMutationRequest(
    request,
    SENTRY_ENVELOPE_CONTENT_TYPES
  );
  if (invalid) return invalid;

  const body = await readBoundedBody(request);
  if (!body.ok) return withTelemetryVary(body.response);

  return withTelemetryVary(await forwardSentryEnvelope(body.body));
};

const isFrontendLogRecord = (value: unknown): value is FrontendLogRecord => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    ['debug', 'error', 'info', 'warn'].includes(String(record.level)) &&
    typeof record.event === 'string'
  );
};

const toFrontendLogBatch = async (request: Request) => {
  const body = await readBoundedBody(request);
  if (!body.ok) return { ok: false as const, response: body.response };

  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(body.body));
  } catch {
    return {
      ok: false as const,
      response: new Response(JSON.stringify({ error: 'invalid_json' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }),
    };
  }

  const records =
    parsed &&
    typeof parsed === 'object' &&
    !Array.isArray(parsed) &&
    Array.isArray((parsed as { records?: unknown }).records)
      ? (parsed as { records: unknown[] }).records
      : [];
  const config = getTelemetryConfig();
  if (records.length > config.logMaxEvents) {
    return { ok: false as const, response: tooManyEvents() };
  }

  return {
    ok: true as const,
    records: records.filter(isFrontendLogRecord),
    bytes: body.body.byteLength,
  };
};

const pinoLevel = (level: TelemetryLogLevel) =>
  level === 'warn' ? 'warn' : level;

export const handleFrontendLogsRequest = async (request: Request) => {
  const invalid = validateTelemetryMutationRequest(
    request,
    new Set(['application/json'])
  );
  if (invalid) return invalid;

  const batch = await toFrontendLogBatch(request);
  if (!batch.ok) return withTelemetryVary(batch.response);

  const logger = getKernel().logger;
  const telemetry = getTelemetry();

  for (const record of batch.records) {
    const sanitized = sanitizeLogFields(record);
    const details =
      sanitized.details &&
      typeof sanitized.details === 'object' &&
      !Array.isArray(sanitized.details)
        ? (sanitized.details as Record<string, unknown>)
        : {};
    const event =
      typeof sanitized.event === 'string'
        ? `frontend.${sanitized.event}`
        : 'frontend.log';
    const level =
      typeof sanitized.level === 'string' &&
      ['debug', 'error', 'info', 'warn'].includes(sanitized.level)
        ? (sanitized.level as TelemetryLogLevel)
        : 'info';

    logger[pinoLevel(level)]({
      details: {
        ...details,
        ...(typeof sanitized.spanId === 'string'
          ? { spanId: sanitized.spanId }
          : {}),
        ...(typeof sanitized.traceId === 'string'
          ? { traceId: sanitized.traceId }
          : {}),
      },
      direction: 'inbound',
      error: typeof sanitized.error === 'string' ? sanitized.error : undefined,
      event,
      sentryExtras: { frontendLog: sanitized },
      sentryTags: { source: 'frontend' },
    });

    telemetry.emitLog({
      attributes: {
        'log.source': 'frontend',
        ...(typeof sanitized.traceId === 'string'
          ? { 'trace.id': sanitized.traceId }
          : {}),
        ...(typeof sanitized.spanId === 'string'
          ? { 'span.id': sanitized.spanId }
          : {}),
      },
      details,
      error: typeof sanitized.error === 'string' ? sanitized.error : undefined,
      event,
      level,
      message:
        typeof sanitized.message === 'string' ? sanitized.message : undefined,
      timestamp:
        typeof sanitized.timestamp === 'string'
          ? new Date(sanitized.timestamp)
          : undefined,
    });

    if (level === 'error') {
      telemetry.captureException(
        new Error(
          typeof sanitized.error === 'string'
            ? sanitized.error
            : typeof sanitized.message === 'string'
              ? sanitized.message
              : event
        ),
        {
          extra: { frontendLog: sanitized },
          level: 'error',
          tags: { event, source: 'frontend' },
        }
      );
    }
  }

  recordLocalTelemetrySummary({
    bytes: batch.bytes,
    eventCount: batch.records.length,
    kind: 'frontend_log',
    signal: 'logs',
    statusCode: 202,
    summary: { accepted: true },
  });

  return withTelemetryVary(accepted());
};
