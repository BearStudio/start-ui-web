import { Result } from '@swan-io/boxed';

import { AppError } from '@/modules/kernel/domain/errors/app-error';
import type { BookId, UserId } from '@/modules/kernel/domain/ids';

import type { BookResult, BookUpdateOutcome, BookUseCaseDeps } from './types';
import type { BookWriteInput } from '../../domain/book';
import { normalizeBookWriteInput } from '../../domain/book';

export type UpdateBookInput = {
  currentUserId: UserId;
  id: BookId;
  book: BookWriteInput;
};

export async function updateBook(
  deps: BookUseCaseDeps,
  input: UpdateBookInput
): Promise<BookResult<BookUpdateOutcome>> {
  const allowed = await deps.permissionChecker.hasPermission(
    input.currentUserId,
    { book: ['update'] }
  );
  if (allowed.isError()) return Result.Error(allowed.getError());
  if (allowed.get().type === 'permission_denied') {
    return Result.Ok({ type: 'book_forbidden' });
  }

  try {
    deps.logger.info({
      event: 'book.update',
      details: { bookId: input.id },
    });
    const book = normalizeBookWriteInput(input.book);
    const result = await deps.transactionRunner.run(({ bookRepository }) =>
      bookRepository.update(input.id, book)
    );
    if (result.isError()) return Result.Error(result.getError());
    return Result.Ok(result.get());
  } catch (error) {
    return Result.Error(
      error instanceof AppError
        ? error
        : new AppError({
            code: 'BOOK_TRANSACTION_ERROR',
            category: 'system',
            status: 500,
            message: 'Book transaction error',
            cause: error,
          })
    );
  }
}
