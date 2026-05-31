import { eq } from 'drizzle-orm';

import { AppError } from '@/modules/kernel/domain/errors/app-error';
import type { UserId } from '@/modules/kernel/domain/ids';
import { toUserId } from '@/modules/kernel/domain/ids';
import { extractDatabaseErrorDetails } from '@/modules/kernel/infrastructure/db/errors';
import { user as userTable } from '@/modules/kernel/infrastructure/db/schema';
import type { DbLike } from '@/modules/kernel/infrastructure/db/types';

import type { AccountRepository } from '../../application/ports/account-repository';
import type {
  AccountOnboardingUpdate,
  AccountProfileUpdate,
  AccountUpdateResult,
} from '../../domain/account';

const isSqlStateCode = (code: unknown): code is string =>
  typeof code === 'string' && /^[A-Z0-9]{5}$/.test(code);

function mapDbError(error: unknown): never {
  const details = extractDatabaseErrorDetails(error);

  if (isSqlStateCode(details?.code)) {
    throw new AppError({
      code: 'ACCOUNT_REPOSITORY_DB_ERROR',
      category: 'system',
      status: 500,
      message: 'Account repository database error',
      cause: error,
    });
  }

  throw new AppError({
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
  ): Promise<AccountUpdateResult | null> {
    try {
      const [updatedUser] = await this.db
        .update(userTable)
        .set({
          name: input.name,
          onboardedAt: input.onboardedAt,
        })
        .where(eq(userTable.id, userId))
        .returning({ id: userTable.id });

      return updatedUser ? { id: toUserId(updatedUser.id) } : null;
    } catch (error) {
      mapDbError(error);
    }
  }

  async updateInfo(
    userId: UserId,
    input: AccountProfileUpdate
  ): Promise<AccountUpdateResult | null> {
    try {
      const [updatedUser] = await this.db
        .update(userTable)
        .set({ name: input.name })
        .where(eq(userTable.id, userId))
        .returning({ id: userTable.id });

      return updatedUser ? { id: toUserId(updatedUser.id) } : null;
    } catch (error) {
      mapDbError(error);
    }
  }
}
