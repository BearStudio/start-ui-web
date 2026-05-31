import { z } from 'zod';

export interface DatabaseErrorDetails {
  name?: string | undefined;
  message?: string | undefined;
  code?: string | undefined;
  detail?: string | undefined;
  schema?: string | undefined;
  table?: string | undefined;
  column?: string | undefined;
  constraint?: string | undefined;
  dataType?: string | undefined;
  severity?: string | undefined;
  hint?: string | undefined;
  position?: string | number | undefined;
  where?: string | undefined;
  routine?: string | undefined;
  internalPosition?: string | number | undefined;
  internalQuery?: string | undefined;
  cause?: string | undefined;
}

const databaseErrorFields = [
  'code',
  'detail',
  'schema',
  'table',
  'column',
  'constraint',
  'dataType',
  'severity',
  'hint',
  'position',
  'where',
  'routine',
  'internalPosition',
  'internalQuery',
] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function readDetailValue(value: unknown): string | number | undefined {
  if (typeof value === 'string' || typeof value === 'number') return value;
  return undefined;
}

function readStringValue(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function readCauseMessage(error: unknown): string | undefined {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return undefined;
}

function readNameAndMessage(
  error: unknown,
  details: DatabaseErrorDetails
): boolean {
  let updated = false;

  if (error instanceof Error) {
    if (details.name === undefined) {
      details.name = error.name;
      updated = true;
    }
    if (details.message === undefined) {
      details.message = error.message;
      updated = true;
    }
  }

  if (isRecord(error)) {
    const nameValue = readStringValue(error.name);
    if (nameValue !== undefined && details.name === undefined) {
      details.name = nameValue;
      updated = true;
    }

    const messageValue = readStringValue(error.message);
    if (messageValue !== undefined && details.message === undefined) {
      details.message = messageValue;
      updated = true;
    }
  }

  return updated;
}

function readDatabaseFields(
  error: unknown,
  details: DatabaseErrorDetails
): boolean {
  if (!isRecord(error)) return false;

  let updated = false;

  for (const field of databaseErrorFields) {
    const value = readDetailValue(error[field]);
    if (value !== undefined && details[field] === undefined) {
      details[field] = value as never;
      updated = true;
    }
  }

  return updated;
}

function ensureStandardDbFields(details: DatabaseErrorDetails): void {
  if (!('code' in details)) details.code = undefined;
  if (!('constraint' in details)) details.constraint = undefined;
  if (!('detail' in details)) details.detail = undefined;
}

export function extractDatabaseErrorDetails(
  error: unknown
): DatabaseErrorDetails | undefined {
  const details: DatabaseErrorDetails = {};
  let hasDetails = false;

  if (readNameAndMessage(error, details)) hasDetails = true;
  if (readDatabaseFields(error, details)) hasDetails = true;

  if (isRecord(error) && 'cause' in error) {
    const cause = error.cause;
    const causeMessage = readCauseMessage(cause);
    if (causeMessage !== undefined && details.cause === undefined) {
      details.cause = causeMessage;
      hasDetails = true;
    }

    if (readNameAndMessage(cause, details)) hasDetails = true;
    if (readDatabaseFields(cause, details)) hasDetails = true;
  }

  if (!hasDetails) return undefined;

  ensureStandardDbFields(details);
  return details;
}

export function withDatabaseErrorDetails(
  details: Record<string, unknown>,
  error: unknown
): Record<string, unknown> {
  const dbError = extractDatabaseErrorDetails(error);
  return dbError ? { ...details, dbError } : details;
}

export interface DatabaseErrorLogFields {
  event: string;
  error: string;
  exception?: Error | undefined;
  details: Record<string, unknown>;
}

export function buildDatabaseErrorLogFields(params: {
  event: string;
  error: unknown;
  context: Record<string, unknown>;
}): DatabaseErrorLogFields {
  const errorMessage =
    params.error instanceof Error ? params.error.message : String(params.error);
  return {
    event: params.event,
    error: errorMessage,
    exception: params.error instanceof Error ? params.error : undefined,
    details: withDatabaseErrorDetails(params.context, params.error),
  };
}

function getCause(error: unknown): unknown {
  return isRecord(error) && 'cause' in error ? error.cause : undefined;
}

function checkErrorOrCause<T>(
  error: unknown,
  schema: z.ZodType<T>,
  predicate: (data: T) => boolean
): boolean {
  const direct = schema.safeParse(error);
  if (direct.success && predicate(direct.data)) return true;

  const cause = getCause(error);
  if (cause === undefined) return false;

  const fromCause = schema.safeParse(cause);
  return fromCause.success && predicate(fromCause.data);
}

function extractFromErrorOrCause<T, R>(
  error: unknown,
  schema: z.ZodType<T>,
  extract: (data: T) => R
): R | undefined {
  const direct = schema.safeParse(error);
  if (direct.success) return extract(direct.data);

  const cause = getCause(error);
  if (cause === undefined) return undefined;

  const fromCause = schema.safeParse(cause);
  return fromCause.success ? extract(fromCause.data) : undefined;
}

const errorWithCodeSchema = z.object({ code: z.string() }).passthrough();

export function isUniqueConstraintViolation(error: unknown): boolean {
  return checkErrorOrCause(
    error,
    errorWithCodeSchema,
    (data) => data.code === '23505'
  );
}

const errorWithConstraintSchema = z
  .object({ constraint: z.string() })
  .passthrough();

export function getConstraintName(error: unknown): string | undefined {
  return extractFromErrorOrCause(
    error,
    errorWithConstraintSchema,
    (data) => data.constraint
  );
}

const errorWithDetailSchema = z.object({ detail: z.string() }).passthrough();

export function getErrorDetail(error: unknown): string | undefined {
  return extractFromErrorOrCause(
    error,
    errorWithDetailSchema,
    (data) => data.detail
  );
}
