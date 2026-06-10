import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  findExpiredAdvisories,
  parseAcceptedAdvisories,
} from '../../../scripts/check-risk-register.mjs';

const register = `# Security Risk Register

## Temporary Accepted Dependency Advisories

| Package | Advisory | Current path | Decision | Next review |
| --- | --- | --- | --- | --- |
| \`esbuild <= 0.24.2\` | Dev server request exposure | \`drizzle-kit\` | Temporarily accepted. | 2026-06-30 |
| \`ws 8.19.0\` | DoS via excessive headers | \`react-cosmos\` | Temporarily accepted. | 2025-01-15 |
`;

describe('risk register policy', () => {
  it('parses advisories with their review dates from the register table', () => {
    expect(parseAcceptedAdvisories(register)).toEqual([
      { advisory: '`esbuild <= 0.24.2`', reviewDate: '2026-06-30' },
      { advisory: '`ws 8.19.0`', reviewDate: '2025-01-15' },
    ]);
  });

  it('ignores table rows without a trailing ISO review date', () => {
    const markdown = [
      '| Package | Next review |',
      '| --- | --- |',
      '| `qs 6.15.x` | upgrade when upstream resolves |',
    ].join('\n');

    expect(parseAcceptedAdvisories(markdown)).toEqual([]);
  });

  it('reports only advisories whose review date has passed', () => {
    expect(findExpiredAdvisories(register, '2026-06-09')).toEqual([
      { advisory: '`ws 8.19.0`', reviewDate: '2025-01-15' },
    ]);
  });

  it('keeps advisories reviewed on the current day in good standing', () => {
    expect(findExpiredAdvisories(register, '2025-01-15')).toEqual([]);
  });

  it('flags all advisories once every review date has passed', () => {
    expect(findExpiredAdvisories(register, '2026-07-01')).toHaveLength(2);
  });

  it('rejects malformed comparison dates', () => {
    expect(() => findExpiredAdvisories(register, 'tomorrow')).toThrow(
      'Invalid ISO date: tomorrow'
    );
  });

  it('parses review dates out of the real risk register', () => {
    const realRegister = fs.readFileSync(
      path.join(process.cwd(), 'docs/security-risk-register.md'),
      'utf8'
    );
    const entries = parseAcceptedAdvisories(realRegister);

    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(entry.reviewDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
