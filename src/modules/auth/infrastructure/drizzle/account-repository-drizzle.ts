import { Result } from '@swan-io/boxed';
import { eq } from 'drizzle-orm';

import type {
  AccountOnboardingUpdate,
  AccountProfileUpdate,
  AccountRepository,
} from '@/modules/account';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import type { UserId } from '@/modules/kernel/domain/ids';
import { toUserId } from '@/modules/kernel/domain/ids';
import { extractDatabaseErrorDetails } from '@/modules/kernel/infrastructure/db/errors';
import { observeRepository } from '@/modules/kernel/infrastructure/db/observability';
import type { DbLike } from '@/modules/kernel/infrastructure/db/types';

import { user as userTable } from './schema';

const isSqlStateCode = (code: unknown): code is string =>
  typeof code === 'string' && /^[A-Z0-9]{5}$/.test(code);

function mapDbError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const details = extractDatabaseErrorDetails(error);

  if (isSqlStateCode(details?.code)) {
    return new AppError({
      code: 'ACCOUNT_REPOSITORY_DB_ERROR',
      category: 'system',
      status: 500,
      message: 'Account repository database error',
      cause: error,
    });
  }

  return new AppError({
    code: 'ACCOUNT_REPOSITORY_ERROR',
    category: 'system',
    status: 500,
    message: 'Account repository error',
    cause: error,
  });
}

export class AccountRepositoryDrizzle implements AccountRepository {
  constructor(private readonly db: DbLike) {}

  async submitOnboarding(
    userId: UserId,
    input: AccountOnboardingUpdate
  ): ReturnType<AccountRepository['submitOnboarding']> {
    try {
      const [updatedUser] = await this.db
        .update(userTable)
        .set({
          name: input.name,
          onboardedAt: input.onboardedAt,
        })
        .where(eq(userTable.id, userId))
        .returning({ id: userTable.id });

      return Result.Ok(
        updatedUser
          ? {
              type: 'account_updated',
              account: { id: toUserId(updatedUser.id) },
            }
          : { type: 'account_not_found' }
      );
    } catch (error) {
      return Result.Error(mapDbError(error));
    }
  }

  async updateInfo(
    userId: UserId,
    input: AccountProfileUpdate
  ): ReturnType<AccountRepository['updateInfo']> {
    try {
      const [updatedUser] = await this.db
        .update(userTable)
        .set({ name: input.name })
        .where(eq(userTable.id, userId))
        .returning({ id: userTable.id });

      return Result.Ok(
        updatedUser
          ? {
              type: 'account_updated',
              account: { id: toUserId(updatedUser.id) },
            }
          : { type: 'account_not_found' }
      );
    } catch (error) {
      return Result.Error(mapDbError(error));
    }
  }
}

export interface AccountRepositoryDrizzleDependencies {
  db: DbLike;
}

export function createAccountRepository(
  dependencies: AccountRepositoryDrizzleDependencies
): AccountRepository {
  return observeRepository(
    new AccountRepositoryDrizzle(dependencies.db),
    'account'
  );
}
