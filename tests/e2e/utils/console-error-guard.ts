import type { ConsoleMessage, Page, TestInfo } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

type BrowserIssue = {
  at: string;
  kind: 'console.error' | 'pageerror';
  location?: ReturnType<ConsoleMessage['location']>;
  stack?: string | null;
  text: string;
  url: string;
};

const allowedConsoleErrors = [
  /The Content Security Policy directive 'upgrade-insecure-requests' is ignored when delivered in a report-only policy\./,
  /Firefox can’t establish a connection to the server at http:\/\/localhost:3000\/__tsd\/console-pipe\/sse\./,
] as const;

const isAllowedConsoleError = (text: string) =>
  allowedConsoleErrors.some((pattern) => pattern.test(text));

const allowedFirefoxViteDependencyLoadErrors = [
  /^error loading dynamically imported module: http:\/\/localhost:3000\/node_modules\/\.vite\/deps\/react\.js\?/,
] as const;

const isAllowedPageError = (error: Error, projectName: string | undefined) => {
  if (
    projectName === 'firefox' &&
    error.message === 'undefined' &&
    error.stack === 'uncaught exception: undefined\n'
  ) {
    return true;
  }

  if (
    projectName === 'webkit' &&
    error.message === 'Importing a module script failed.' &&
    (error.stack ?? '').includes(
      'http://localhost:3000/@id/virtual:tanstack-start-dev-client-entry'
    )
  ) {
    return true;
  }

  return (
    projectName === 'firefox' &&
    allowedFirefoxViteDependencyLoadErrors.some((pattern) =>
      pattern.test(error.message)
    )
  );
};

const writeIssues = async (
  testInfo: TestInfo,
  label: string,
  issues: BrowserIssue[]
) => {
  if (issues.length === 0) {
    return;
  }

  const path = testInfo.outputPath(`${label}.json`);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(issues, null, 2));

  await testInfo.attach(`${label}.json`, {
    contentType: 'application/json',
    path,
  });
};

export function installConsoleErrorGuard(page: Page, testInfo: TestInfo) {
  const issues: BrowserIssue[] = [];

  page.on('console', (message) => {
    if (message.type() !== 'error') {
      return;
    }

    const text = message.text();
    if (isAllowedConsoleError(text)) {
      return;
    }

    issues.push({
      at: new Date().toISOString(),
      kind: 'console.error',
      location: message.location(),
      text,
      url: page.url(),
    });
  });

  page.on('pageerror', (error) => {
    if (isAllowedPageError(error, testInfo.project.name)) {
      return;
    }

    issues.push({
      at: new Date().toISOString(),
      kind: 'pageerror',
      stack: error.stack ?? null,
      text: error.message,
      url: page.url(),
    });
  });

  const attach = (label = 'browser-console-issues') =>
    writeIssues(testInfo, label, issues);

  return {
    attach,
    assertNoUnexpectedIssues: async () => {
      if (issues.length === 0) {
        return;
      }

      await attach();
      throw new Error(
        [
          `Unexpected browser console issues in "${testInfo.title}".`,
          ...issues.map((issue) => `- ${issue.kind}: ${issue.text}`),
          'See the attached browser-console-issues.json artifact.',
        ].join('\n')
      );
    },
  };
}
