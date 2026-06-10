import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const registerPath = path.join(root, 'docs/security-risk-register.md');

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function parseAcceptedAdvisories(markdown) {
  const entries = [];

  for (const line of markdown.split('\n')) {
    if (!line.trimStart().startsWith('|')) continue;

    const cells = line
      .split('|')
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);
    if (cells.length < 2) continue;

    const reviewDate = cells.at(-1);
    if (!isoDatePattern.test(reviewDate)) continue;

    entries.push({ advisory: cells[0], reviewDate });
  }

  return entries;
}

export function findExpiredAdvisories(markdown, todayIsoDate) {
  if (!isoDatePattern.test(todayIsoDate)) {
    throw new Error(`Invalid ISO date: ${todayIsoDate}`);
  }

  // ISO dates compare correctly as strings.
  return parseAcceptedAdvisories(markdown).filter(
    (entry) => entry.reviewDate < todayIsoDate
  );
}

function readRegister() {
  if (!fs.existsSync(registerPath)) {
    throw new Error(`Missing risk register: ${registerPath}`);
  }

  return fs.readFileSync(registerPath, 'utf8');
}

function main() {
  const markdown = readRegister();
  const entries = parseAcceptedAdvisories(markdown);

  if (markdown.includes('Next review') && entries.length === 0) {
    console.error(
      'Risk register policy failed: the register declares review dates but none could be parsed; fix the table format or this check.'
    );
    process.exit(1);
  }

  const today = new Date().toISOString().slice(0, 10);
  const expired = findExpiredAdvisories(markdown, today);

  if (expired.length > 0) {
    console.error(
      'Risk register policy failed: accepted advisories are past their review date:'
    );
    for (const entry of expired) {
      console.error(`- ${entry.advisory} (review was due ${entry.reviewDate})`);
    }
    console.error(
      'Re-review each advisory in docs/security-risk-register.md: upgrade the dependency or extend the review date with justification.'
    );
    process.exit(1);
  }

  console.log(
    `Risk register policy passed (${entries.length} accepted advisories, none past review).`
  );
}

if (
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url
) {
  main();
}
