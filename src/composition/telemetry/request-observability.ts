import type { TextMapGetter } from '@opentelemetry/api';
import { context, propagation } from '@opentelemetry/api';

import type {
  TelemetryAttributes,
  TelemetryMetricInput,
} from '@/platform/telemetry';
import { getTelemetry } from '@/platform/telemetry';

type RequestObservationInput = {
  request: Request;
  pathname: string;
  handlerType: string;
  requestId?: string;
};

const TELEMETRY_ROUTE_PREFIX = '/api/telemetry/';

const headersGetter: TextMapGetter<Headers> = {
  get: (carrier, key) => carrier.get(key) ?? undefined,
  keys: (carrier) => Array.from(carrier.keys()),
};

const isPromiseLike = <T>(value: T): value is T & Promise<Awaited<T>> =>
  value != null &&
  typeof value === 'object' &&
  'then' in value &&
  typeof (value as { then?: unknown }).then === 'function';

const isAlphaNumeric = (charCode: number) =>
  (charCode >= 48 && charCode <= 57) ||
  (charCode >= 65 && charCode <= 90) ||
  (charCode >= 97 && charCode <= 122);

const isHex = (charCode: number) =>
  (charCode >= 48 && charCode <= 57) ||
  (charCode >= 65 && charCode <= 70) ||
  (charCode >= 97 && charCode <= 102);

const everyCharCode = (
  value: string,
  predicate: (charCode: number) => boolean
) => {
  for (let index = 0; index < value.length; index += 1) {
    if (!predicate(value.charCodeAt(index))) return false;
  }

  return true;
};

const isIdPathSegment = (segment: string) =>
  (segment.length >= 21 &&
    segment[0]?.toLowerCase() === 'c' &&
    everyCharCode(segment, isAlphaNumeric)) ||
  (segment.length >= 8 && everyCharCode(segment, isHex));

const normalizePathname = (pathname: string) => {
  let end = pathname.length;
  while (end > 1 && pathname.charCodeAt(end - 1) === 47) end -= 1;
  return pathname.slice(0, end);
};

const routeTemplateFromPathname = (pathname: string) =>
  normalizePathname(pathname)
    .split('/')
    .map((segment) => (isIdPathSegment(segment) ? '$id' : segment))
    .join('/');

const responseFromResult = (result: unknown): Response | undefined => {
  if (result instanceof Response) return result;

  if (typeof result !== 'object' || result === null) return undefined;

  const response = (result as { response?: unknown }).response;
  return response instanceof Response ? response : undefined;
};

const statusClass = (statusCode: number | undefined) =>
  statusCode ? `${Math.floor(statusCode / 100)}xx` : undefined;

const requestMetricAttributes = (
  attributes: TelemetryAttributes,
  result: unknown,
  status: 'success' | 'error'
) => {
  const statusCode = responseFromResult(result)?.status;

  return {
    ...attributes,
    ...(statusCode ? { 'http.response.status_code': statusCode } : {}),
    ...(statusClass(statusCode)
      ? { 'http.response.status_class': statusClass(statusCode) }
      : {}),
    status,
  };
};

const recordRequestMetric = (input: TelemetryMetricInput) => {
  try {
    getTelemetry().recordMetric(input);
  } catch {
    // Request telemetry must never change request handling behavior.
  }
};

export function observeHttpRequest<T>(
  { request, pathname, handlerType, requestId }: RequestObservationInput,
  next: () => T
): T {
  if (pathname.startsWith(TELEMETRY_ROUTE_PREFIX)) return next();

  const routeTemplate = routeTemplateFromPathname(pathname);
  const url = new URL(request.url);
  const metricAttributes = {
    'http.request.method': request.method,
    'http.route': routeTemplate,
    'server.address': url.hostname,
    'tanstack.handler_type': handlerType,
    'url.scheme': url.protocol.replace(/:$/, ''),
  } satisfies TelemetryAttributes;
  const spanAttributes = {
    ...metricAttributes,
    ...(requestId ? { 'app.request_id': requestId } : {}),
  } satisfies TelemetryAttributes;
  const startedAt = performance.now();

  const finish = <TValue>(value: TValue): TValue => {
    const durationMs = performance.now() - startedAt;
    recordRequestMetric({
      attributes: requestMetricAttributes(metricAttributes, value, 'success'),
      name: 'app.http.request.duration',
      type: 'histogram',
      unit: 'ms',
      value: durationMs,
    });

    return value;
  };

  const fail = (error: unknown): never => {
    const durationMs = performance.now() - startedAt;
    recordRequestMetric({
      attributes: requestMetricAttributes(metricAttributes, error, 'error'),
      name: 'app.http.request.duration',
      type: 'histogram',
      unit: 'ms',
      value: durationMs,
    });
    throw error;
  };

  const extractedContext = propagation.extract(
    context.active(),
    request.headers,
    headersGetter
  );

  return context.with(extractedContext, () =>
    getTelemetry().startSpan(
      {
        attributes: spanAttributes,
        name: `http.request ${request.method} ${routeTemplate}`,
        op: 'http.server',
      },
      () => {
        try {
          const result = next();
          if (!isPromiseLike(result)) return finish(result);

          return result.then(finish, fail) as T;
        } catch (error) {
          return fail(error);
        }
      }
    )
  );
}
