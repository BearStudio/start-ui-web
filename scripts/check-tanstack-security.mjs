import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const lockfilePath = path.join(root, 'pnpm-lock.yaml');

const vulnerableFloors = [
  {
    packageName: '@tanstack/start-server-core',
    fixedVersion: '1.167.30',
    advisory: 'GHSA-6c2q-82f8-v2r4',
  },
  {
    packageName: '@tanstack/react-query-next-experimental',
    fixedVersion: '5.18.0',
    advisory: 'GHSA-9m2r-r2m5-3m2h',
  },
];

const compromisedVersions = new Map(
  Object.entries({
    '@tanstack/arktype-adapter': ['1.166.12', '1.166.15'],
    '@tanstack/eslint-plugin-router': ['1.161.9', '1.161.12'],
    '@tanstack/eslint-plugin-start': ['0.0.4', '0.0.7'],
    '@tanstack/history': ['1.161.9', '1.161.12'],
    '@tanstack/nitro-v2-vite-plugin': ['1.154.12', '1.154.15'],
    '@tanstack/react-router': ['1.169.5', '1.169.8'],
    '@tanstack/react-router-devtools': ['1.166.16', '1.166.19'],
    '@tanstack/react-router-ssr-query': ['1.166.15', '1.166.18'],
    '@tanstack/react-start': ['1.167.68', '1.167.71'],
    '@tanstack/react-start-client': ['1.166.51', '1.166.54'],
    '@tanstack/react-start-rsc': ['0.0.47', '0.0.50'],
    '@tanstack/react-start-server': ['1.166.55', '1.166.58'],
    '@tanstack/router-cli': ['1.166.46', '1.166.49'],
    '@tanstack/router-core': ['1.169.5', '1.169.8'],
    '@tanstack/router-devtools': ['1.166.16', '1.166.19'],
    '@tanstack/router-devtools-core': ['1.167.6', '1.167.9'],
    '@tanstack/router-generator': ['1.166.45', '1.166.48'],
    '@tanstack/router-plugin': ['1.167.38', '1.167.41'],
    '@tanstack/router-ssr-query-core': ['1.168.3', '1.168.6'],
    '@tanstack/router-utils': ['1.161.11', '1.161.14'],
    '@tanstack/router-vite-plugin': ['1.166.53', '1.166.56'],
    '@tanstack/solid-router': ['1.169.5', '1.169.8'],
    '@tanstack/solid-router-devtools': ['1.166.16', '1.166.19'],
    '@tanstack/solid-router-ssr-query': ['1.166.15', '1.166.18'],
    '@tanstack/solid-start': ['1.167.65', '1.167.68'],
    '@tanstack/solid-start-client': ['1.166.50', '1.166.53'],
    '@tanstack/solid-start-server': ['1.166.54', '1.166.57'],
    '@tanstack/start-client-core': ['1.168.5', '1.168.8'],
    '@tanstack/start-fn-stubs': ['1.161.9', '1.161.12'],
    '@tanstack/start-plugin-core': ['1.169.23', '1.169.26'],
    '@tanstack/start-server-core': ['1.167.33', '1.167.36'],
    '@tanstack/start-static-server-functions': ['1.166.44', '1.166.47'],
    '@tanstack/start-storage-context': ['1.166.38', '1.166.41'],
    '@tanstack/valibot-adapter': ['1.166.12', '1.166.15'],
    '@tanstack/virtual-file-routes': ['1.161.10', '1.161.13'],
    '@tanstack/vue-router': ['1.169.5', '1.169.8'],
    '@tanstack/vue-router-devtools': ['1.166.16', '1.166.19'],
    '@tanstack/vue-router-ssr-query': ['1.166.15', '1.166.18'],
    '@tanstack/vue-start': ['1.167.61', '1.167.64'],
    '@tanstack/vue-start-client': ['1.166.46', '1.166.49'],
    '@tanstack/vue-start-server': ['1.166.50', '1.166.53'],
    '@tanstack/zod-adapter': ['1.166.12', '1.166.15'],
  }).map(([packageName, versions]) => [packageName, new Set(versions)])
);

const iocs = [
  '@tanstack/setup',
  'github:tanstack/router#79ac49eedf774dd4b0cfa308722bc463cfe5885c',
  'router_init.js',
];

function parseVersion(version) {
  return version
    .split('-')[0]
    .split('.')
    .map((part) => Number.parseInt(part, 10))
    .map((value) => (Number.isFinite(value) ? value : 0));
}

function compareVersions(left, right) {
  const leftParts = parseVersion(left);
  const rightParts = parseVersion(right);
  const maxLength = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftPart = leftParts[index] ?? 0;
    const rightPart = rightParts[index] ?? 0;
    if (leftPart !== rightPart) return Math.sign(leftPart - rightPart);
  }

  return 0;
}

function readLockfile() {
  if (!fs.existsSync(lockfilePath)) {
    throw new Error(`Missing lockfile: ${lockfilePath}`);
  }

  return fs.readFileSync(lockfilePath, 'utf8');
}

function findPackageVersions(lockfile) {
  const versions = new Map();
  const pattern = /(@tanstack\/[A-Za-z0-9._-]+)@([0-9][0-9A-Za-z.-]*)/g;

  for (const match of lockfile.matchAll(pattern)) {
    const [, packageName, version] = match;
    if (!versions.has(packageName)) versions.set(packageName, new Set());
    versions.get(packageName).add(version);
  }

  return versions;
}

const lockfile = readLockfile();
const versions = findPackageVersions(lockfile);
const failures = [];

for (const { packageName, fixedVersion, advisory } of vulnerableFloors) {
  for (const version of versions.get(packageName) ?? []) {
    if (compareVersions(version, fixedVersion) < 0) {
      failures.push(
        `${packageName}@${version} is below ${fixedVersion} (${advisory})`
      );
    }
  }
}

for (const [packageName, deniedVersions] of compromisedVersions) {
  for (const version of versions.get(packageName) ?? []) {
    if (deniedVersions.has(version)) {
      failures.push(
        `${packageName}@${version} is a known compromised TanStack Router/Start incident version`
      );
    }
  }
}

for (const ioc of iocs) {
  if (lockfile.includes(ioc)) {
    failures.push(`Lockfile contains TanStack incident IOC: ${ioc}`);
  }
}

if (failures.length > 0) {
  console.error('TanStack security policy failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('TanStack security policy passed.');
