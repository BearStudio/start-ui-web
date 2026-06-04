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
    const parsedUrl = new URL(url);

    expect(parsedUrl.protocol).toBe('postgres:');
    expect(parsedUrl.username).toMatch(
      /^generated-database-pr-62-principal-credential-[a-z0-9-]+$/
    );
    expect(parsedUrl.password).toMatch(
      /^generated-database-pr-62-verifier-credential-[a-z0-9-]+$/
    );
    expect(parsedUrl.host).toBe('localhost:5432');
    expect(parsedUrl.pathname).toBe('/start-ui-test');
    expect(parsedUrl.searchParams.get('sslmode')).toBe('require');
  });
});
