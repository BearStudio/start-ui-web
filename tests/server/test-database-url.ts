import { makeTestSecret } from '../support/test-secrets';

type TestDatabaseUrlOptions = {
  credentialLabel?: string;
  databaseName?: string;
  host?: string;
  port?: number | null;
  protocol?: 'postgres' | 'postgresql';
  searchParams?: Record<string, string>;
};

const normalizeCredentialPart = (value: string) => {
  let normalized = '';
  let needsSeparator = false;

  for (const char of value.toLowerCase()) {
    const code = char.charCodeAt(0);
    const isDigit = code >= 48 && code <= 57;
    const isLowercaseLetter = code >= 97 && code <= 122;

    if (isDigit || isLowercaseLetter) {
      if (needsSeparator && normalized) normalized += '-';
      normalized += char;
      needsSeparator = false;
      continue;
    }

    needsSeparator = Boolean(normalized);
  }

  return normalized;
};

export function makeTestCredential(...parts: string[]) {
  return ['generated', ...parts.map(normalizeCredentialPart)]
    .filter(Boolean)
    .join('-');
}

const makeRandomizedTestCredential = (...parts: string[]) =>
  makeTestCredential(...parts, makeTestSecret('credential', 8));

export function makeTestDatabaseUrl({
  credentialLabel = 'default',
  databaseName = 'app',
  host = 'localhost',
  port,
  protocol = 'postgres',
  searchParams = {},
}: TestDatabaseUrlOptions = {}) {
  const resolvedPort = port === undefined ? 5432 : port;
  const hostAndPort = resolvedPort === null ? host : `${host}:${resolvedPort}`;
  const url = new URL(`${protocol}://${hostAndPort}/${databaseName}`);

  url.username = makeRandomizedTestCredential(
    'database',
    credentialLabel,
    'principal'
  );
  url.password = makeRandomizedTestCredential(
    'database',
    credentialLabel,
    'verifier'
  );

  for (const [name, value] of Object.entries(searchParams)) {
    url.searchParams.set(name, value);
  }

  return url.toString();
}
