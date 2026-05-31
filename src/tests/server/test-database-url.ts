type TestDatabaseUrlOptions = {
  credentialLabel?: string;
  databaseName?: string;
  host?: string;
  port?: number | null;
  protocol?: 'postgres' | 'postgresql';
  searchParams?: Record<string, string>;
};

const normalizeCredentialPart = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export function makeTestCredential(...parts: string[]) {
  return ['generated', ...parts.map(normalizeCredentialPart)]
    .filter(Boolean)
    .join('-');
}

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

  url.username = makeTestCredential('database', credentialLabel, 'principal');
  url.password = makeTestCredential('database', credentialLabel, 'verifier');

  for (const [name, value] of Object.entries(searchParams)) {
    url.searchParams.set(name, value);
  }

  return url.toString();
}
