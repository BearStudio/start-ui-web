import { describe, expect, it } from 'vitest';

import {
  extractDatabaseErrorDetails,
  getConstraintName,
  getErrorDetail,
  isUniqueConstraintViolation,
  withDatabaseErrorDetails,
} from '@/modules/kernel/infrastructure/db/db-error-details';

describe('database error details', () => {
  it('extracts direct Postgres fields', () => {
    const error = Object.assign(new Error('duplicate key'), {
      code: '23505',
      constraint: 'user_email_key',
      detail: 'Key (email) already exists.',
      hint: 'Use another email.',
      severity: 'ERROR',
    });

    expect(extractDatabaseErrorDetails(error)).toMatchObject({
      name: 'Error',
      message: 'duplicate key',
      code: '23505',
      constraint: 'user_email_key',
      detail: 'Key (email) already exists.',
      hint: 'Use another email.',
      severity: 'ERROR',
    });
    expect(isUniqueConstraintViolation(error)).toBe(true);
    expect(getConstraintName(error)).toBe('user_email_key');
    expect(getErrorDetail(error)).toBe('Key (email) already exists.');
  });

  it('extracts wrapped cause fields', () => {
    const cause = Object.assign(new Error('driver detail'), {
      code: '23505',
      constraint: 'book_title_author_key',
      detail: 'Key (title, author) already exists.',
    });
    const error = new Error('drizzle wrapper', { cause });

    expect(extractDatabaseErrorDetails(error)).toMatchObject({
      message: 'drizzle wrapper',
      cause: 'driver detail',
      code: '23505',
      constraint: 'book_title_author_key',
    });
    expect(isUniqueConstraintViolation(error)).toBe(true);
    expect(getConstraintName(error)).toBe('book_title_author_key');
  });

  it('keeps context unchanged when no database details exist', () => {
    const context = { operation: 'users.list' };

    expect(withDatabaseErrorDetails(context, 'plain failure')).toBe(context);
  });
});
