import { extractDatabaseErrorDetails } from './db-error-details';

export type PgError = Error & {
  code: string;
  constraint?: string;
  file?: string;
  line?: string;
  routine?: string;
  severity: string;
};

type PgErrorCandidate = Error & {
  code?: unknown;
  file?: unknown;
  line?: unknown;
  routine?: unknown;
  severity?: unknown;
};

export const isPgError = (error: unknown): error is PgError => {
  if (!(error instanceof Error)) {
    const details = extractDatabaseErrorDetails(error);
    return (
      typeof details?.code === 'string' && /^[A-Z0-9]{5}$/.test(details.code)
    );
  }

  const candidate = error as PgErrorCandidate;
  const hasPgSource =
    typeof candidate.file === 'string' ||
    typeof candidate.line === 'string' ||
    typeof candidate.routine === 'string';

  return (
    typeof candidate.code === 'string' &&
    /^[A-Z0-9]{5}$/.test(candidate.code) &&
    typeof candidate.severity === 'string' &&
    hasPgSource
  );
};

export {
  buildDatabaseErrorLogFields,
  extractDatabaseErrorDetails,
  getConstraintName,
  getErrorDetail,
  isUniqueConstraintViolation,
  withDatabaseErrorDetails,
} from './db-error-details';
