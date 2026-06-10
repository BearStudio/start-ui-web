import { describe, expect, it } from 'vitest';

import {
  resolveTrustedTool,
  TrustedToolError,
} from '../../../scripts/trusted-tool';

describe('trusted tool resolution', () => {
  it('rejects tool names with path separators', () => {
    expect(() => resolveTrustedTool('../git')).toThrow(TrustedToolError);
  });

  it('resolves git from the fixed trusted directory allowlist', () => {
    expect(resolveTrustedTool('git')).toMatch(/git(?:\.exe)?$/);
  });
});
