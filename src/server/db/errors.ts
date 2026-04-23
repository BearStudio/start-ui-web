import { ORPCError } from '@orpc/server';
import { DrizzleQueryError } from 'drizzle-orm/errors';

type QueryErrorCause = {
  code?: string;
  constraint_name?: string;
  column_name?: string;
  detail?: string;
  message?: string;
};

const UNIQUE_KEY_DETAIL_REGEX = /Key \((.+)\)=/;

function getTargetFields(cause: QueryErrorCause): string[] | undefined {
  if (cause.constraint_name === 'user_email_key') {
    return ['email'];
  }

  if (cause.constraint_name === 'book_title_author_key') {
    return ['title', 'author'];
  }

  const detail = cause.detail ?? '';
  const match = UNIQUE_KEY_DETAIL_REGEX.exec(detail);
  return match?.[1]
    ?.split(', ')
    .map((field) => field.replaceAll('"', '').trim())
    .filter(Boolean);
}

export function mapDatabaseError(error: unknown): ORPCError<string, unknown> {
  if (error instanceof ORPCError) {
    return error;
  }

  if (error instanceof DrizzleQueryError) {
    const cause = (error.cause ?? {}) as QueryErrorCause;

    switch (cause.code) {
      case '23505':
        return new ORPCError('CONFLICT', {
          message: 'Unique constraint violation',
          data: { target: getTargetFields(cause) },
        });
      case '23503':
        return new ORPCError('BAD_REQUEST', {
          message: 'Foreign key constraint violation',
        });
      case '23502':
      case '22P02':
        return new ORPCError('BAD_REQUEST', {
          message: 'Database validation error',
        });
      default:
        return new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Database error',
        });
    }
  }

  return new ORPCError('INTERNAL_SERVER_ERROR', {
    message: 'Unhandled error',
  });
}
