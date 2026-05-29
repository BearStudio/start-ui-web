module.exports = {
  forbidden: [
    {
      name: 'legacy-features-root-removed',
      severity: 'error',
      from: {},
      to: { path: '^src/features' },
    },
    {
      name: 'platform-is-module-agnostic',
      severity: 'error',
      comment:
        'src/platform is the shared technical substrate and must not import modules, routes, or composition.',
      from: { path: '^src/platform' },
      to: { path: '^src/(modules|routes|composition)' },
    },
    {
      name: 'module-internals-do-not-import-composition',
      severity: 'error',
      comment:
        'Composition is the wiring root. Module internals receive dependencies through factories or public server barrels.',
      from: {
        path: '^src/modules/[^/]+/(domain|application|infrastructure|transport|presentation|factory)',
      },
      to: { path: '^src/composition' },
    },
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
      name: 'domain-no-presentation',
      severity: 'error',
      from: { path: '^src/modules/(book|user|genre|account)/domain' },
      to: { path: '^src/modules/(book|user|genre|account)/presentation' },
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
      name: 'application-no-presentation',
      severity: 'error',
      from: { path: '^src/modules/(book|user|genre|account)/application' },
      to: { path: '^src/modules/(book|user|genre|account)/presentation' },
    },
    {
      name: 'application-no-react-or-router',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/application' },
      to: { path: '^(react|@tanstack/react-router|@tanstack/react-query)' },
    },
    {
      name: 'business-code-no-sentry-sdk',
      severity: 'error',
      comment:
        'Domain and application code must log through the Logger port instead of importing Sentry directly.',
      from: { path: '^src/modules/[^/]+/(domain|application)' },
      to: { path: 'node_modules/@sentry/' },
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
      name: 'infrastructure-no-presentation',
      severity: 'error',
      from: { path: '^src/modules/(book|user|genre|account)/infrastructure' },
      to: { path: '^src/modules/(book|user|genre|account)/presentation' },
    },
    {
      name: 'transport-no-infrastructure',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/transport' },
      to: { path: '^src/modules/(?!kernel)[^/]+/infrastructure' },
    },
    {
      name: 'transport-no-presentation',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/transport' },
      to: { path: '^src/modules/(?!kernel)[^/]+/presentation' },
    },
    {
      name: 'server-entrypoints-no-feature-internals',
      severity: 'error',
      comment:
        'Server function entrypoints stay thin; use transport handlers and composition instead of feature internals.',
      from: { path: '^src/modules/[^/]+/(server|server-functions)\\.ts$' },
      to: {
        path: '^src/modules/(?!kernel)[^/]+/(infrastructure|presentation)',
      },
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
      from: { path: '^src/(routes|platform)' },
      to: { path: '^src/modules/[^/]+/infrastructure' },
    },
    {
      name: 'start-no-static-infrastructure-imports',
      severity: 'error',
      comment:
        'src/start.ts is reachable from the client entry; load server-only infrastructure lazily from server middleware.',
      from: { path: '^src/start\\.ts$' },
      to: {
        path: '^src/modules/[^/]+/infrastructure',
        dependencyTypesNot: ['dynamic-import', 'type-only'],
      },
    },
    {
      name: 'only-composition-imports-feature-infrastructure',
      severity: 'error',
      comment:
        'Routes, transport, and other features must not import infrastructure adapters directly. Go through composition.',
      from: {
        pathNot:
          '^src/(composition|modules/[^/]+/infrastructure|modules/kernel)',
      },
      to: {
        path: '^src/modules/(?!kernel)[^/]+/infrastructure',
      },
    },
    {
      name: 'only-composition-imports-module-factory',
      severity: 'error',
      comment:
        'Module factory functions are wired by composition. Production callers use composed entry points.',
      from: {
        pathNot:
          '^src/(composition|modules/[^/]+/index\\.ts|modules/[^/]+/application/__tests__/.*\\.unit\\.(test|spec)\\.ts)',
      },
      to: {
        path: '^src/modules/[^/]+/factory\\.(ts|tsx)$',
      },
    },
    {
      name: 'composition-does-not-import-routes',
      severity: 'error',
      from: { path: '^src/composition' },
      to: { path: '^src/routes' },
    },
    {
      name: 'routes-use-module-public-api',
      severity: 'error',
      from: { path: '^src/routes' },
      to: {
        path: '^src/modules/[^/]+/(?!index\\.|presentation\\.|server\\.|client\\.)',
      },
    },
    {
      name: 'presentation-schema-no-i18n',
      severity: 'error',
      comment:
        'presentation/schema.ts must emit error codes, not translated strings. Translation happens at render in platform/components/form/form-field-error.tsx.',
      from: { path: '^src/modules/[^/]+/presentation/schema\\.ts$' },
      to: { path: 'node_modules/(?:i18next|react-i18next)/' },
    },
    {
      name: 'better-auth-server-confined',
      severity: 'error',
      comment:
        'better-auth server APIs may only be imported from src/modules/auth/ and src/composition/auth.ts. better-auth/react and better-auth/client/plugins are allowed in auth/presentation/.',
      from: {
        pathNot: '^(src/modules/auth/|src/composition/auth\\.ts$)',
      },
      to: { path: 'node_modules/better-auth/' },
    },
    {
      name: 'legacy-server-entrypoints-removed',
      severity: 'error',
      from: {},
      to: { path: '^src/server/' },
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
