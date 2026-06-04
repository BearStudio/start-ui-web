import {
  makeTestCredential,
  makeTestDatabaseUrl,
} from '@tests/server/test-database-url';
import { describe, expect, it } from 'vitest';

describe('test database URL helpers', () => {
  it('normalizes credential labels without regex backtracking risk', () => {
    expect(
      makeTestCredential(' Database ', 'Feature ++ Branch', 'Verifier!')
    ).toBe('generated-database-feature-branch-verifier');
  });

  it('builds database URLs with generated credentials and search params', () => {
    const url = makeTestDatabaseUrl({
      credentialLabel: 'PR 62',
      databaseName: 'start-ui-test',
      searchParams: {
        sslmode: 'require',
      },
    });

    expect(url).toBe(
      'postgres://generated-database-pr-62-principal:generated-database-pr-62-verifier@localhost:5432/start-ui-test?sslmode=require' // pragma: allowlist secret
    );
  });
});
