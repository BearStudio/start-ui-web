module.exports = {
  forbidden: [
    {
      name: 'domain-no-react-or-router',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/domain' },
      to: {
        path: '^(react|react-dom|@tanstack/react-router|@tanstack/react-query)',
      },
    },
    {
      name: 'domain-no-infrastructure-or-sdks',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/domain' },
      to: {
        path: '(^src/modules/[^/]+/infrastructure|^drizzle-orm|^pg|^postgres)',
      },
    },
    {
      name: 'domain-no-transport',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/domain' },
      to: { path: '^src/modules/[^/]+/transport' },
    },
    {
      name: 'application-no-infrastructure',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/application' },
      to: { path: '^src/modules/[^/]+/infrastructure' },
    },
    {
      name: 'application-no-transport',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/application' },
      to: { path: '^src/modules/[^/]+/transport' },
    },
    {
      name: 'application-no-react-or-router',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/application' },
      to: { path: '^(react|@tanstack/react-router|@tanstack/react-query)' },
    },
    {
      name: 'no-cross-feature-deep-import',
      severity: 'error',
      comment:
        'Cross-module imports must go through module public files: index.ts, presentation.ts, server.ts, or client.ts',
      from: { path: '^src/modules/([^/]+)/' },
      to: {
        path: '^src/modules/(?!\\1)([^/]+)/(?!index\\.|presentation\\.|server\\.|client\\.)',
        pathNot: '^src/modules/kernel/',
      },
    },
    {
      name: 'presentation-no-infrastructure',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/presentation' },
      to: { path: '^src/modules/(?!kernel)[^/]+/infrastructure' },
    },
    {
      name: 'transport-no-infrastructure',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/transport' },
      to: { path: '^src/modules/(?!kernel)[^/]+/infrastructure' },
    },
    {
      name: 'kernel-no-feature-imports',
      severity: 'error',
      from: { path: '^src/modules/kernel' },
      to: { path: '^src/modules/(?!kernel)' },
    },
    {
      name: 'routes-no-direct-infrastructure',
      severity: 'error',
      from: { path: '^src/(routes|components|features)' },
      to: { path: '^src/modules/[^/]+/infrastructure' },
    },
    {
      name: 'routes-use-module-public-api',
      severity: 'error',
      from: { path: '^src/(routes|components|layout|devtools)' },
      to: {
        path: '^src/modules/[^/]+/(?!index\\.|presentation\\.|server\\.|client\\.)',
      },
    },
    {
      name: 'legacy-server-entrypoints-removed',
      severity: 'error',
      from: {},
      to: { path: '^src/server' },
    },
    {
      name: 'drizzle-confined-to-infrastructure',
      severity: 'error',
      from: {
        pathNot:
          '^src/(modules/[^/]+/infrastructure|modules/kernel/infrastructure|composition|drizzle)',
      },
      to: { path: '^drizzle-orm' },
    },
    {
      name: 'server-only-from-client',
      severity: 'error',
      from: { path: '\\.client\\.(ts|tsx)$' },
      to: { path: '\\.server\\.(ts|tsx)$|^src/modules/[^/]+/infrastructure' },
    },
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      conditionNames: ['import', 'types', 'node', 'default'],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'],
      exportsFields: ['exports'],
    },
  },
};
