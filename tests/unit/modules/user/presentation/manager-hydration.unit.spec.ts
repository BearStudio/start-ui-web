import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const managerUserFiles = [
  new URL(
    '../../../../../src/modules/user/presentation/manager/page-user.tsx',
    import.meta.url
  ),
  new URL(
    '../../../../../src/modules/user/presentation/manager/page-users.tsx',
    import.meta.url
  ),
];

describe('manager user query hydration policy', () => {
  it('does not disable user queries behind hydration gates', async () => {
    for (const file of managerUserFiles) {
      const source = await readFile(file, 'utf8');

      expect(source).not.toContain('useHydrated');
      // User manager queries must not be hydration-gated; `enabled:` is
      // intentionally disallowed in these files to prevent reintroducing it.
      expect(source).not.toMatch(/\benabled\s*:/);
    }
  });
});
