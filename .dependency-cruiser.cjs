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
        path: '^src/modules/[^/]+/(domain|application|infrastructure|transport/(?!server-functions)|presentation|factory)',
      },
      to: { path: '^src/composition' },
    },
    {
      name: 'module-internals-do-not-import-app',
      severity: 'error',
      comment:
        'src/app composes shell and support UI around feature modules; modules must not depend on app code.',
      from: { path: '^src/modules' },
      to: { path: '^src/app' },
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
        path: '(^src/modules/[^/]+/infrastructure|^drizzle-orm|^@neondatabase/serverless|^pg|^postgres)',
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
      name: 'application-no-other-feature-modules',
      severity: 'error',
      comment:
        'Application code depends on its own domain/application ports and kernel primitives. Cross-feature collaboration goes through injected ports and composition.',
      from: {
        path: '^src/modules/([^/]+)/application',
        pathNot: '^src/modules/kernel/',
      },
      to: {
        path: '^src/modules/(?!kernel/)[^/]+(?:/|$)',
        pathNot: '^src/modules/$1(?:/|$)',
      },
    },
    {
      name: 'application-only-own-domain-and-application',
      severity: 'error',
      comment:
        'Inside a feature, application code may depend only on its own application layer and domain layer.',
      from: {
        path: '^src/modules/([^/]+)/application',
        pathNot: '^src/modules/kernel/',
      },
      to: {
        path: '^src/modules/$1/(?!application(?:/|$)|domain(?:/|$))',
      },
    },
    {
      name: 'application-no-kernel-infrastructure-or-transport',
      severity: 'error',
      comment:
        'Feature application code may use kernel domain/application primitives, not kernel adapters or protocol mappers.',
      from: { path: '^src/modules/(?!kernel/)[^/]+/application' },
      to: { path: '^src/modules/kernel/(infrastructure|transport)' },
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
        'Cross-module imports must go through module public files: index.ts, presentation.ts, server.ts, backend.ts, client.ts, presentation.ts, or testing.ts',
      from: { path: '^src/modules/([^/]+)/' },
      to: {
        path: '^src/modules/[^/]+/(?!index\\.|presentation\\.|server\\.|backend\\.|client\\.|testing\\.)',
        pathNot:
          '^src/modules/($1|kernel)/|^src/modules/[^/]+/infrastructure/drizzle/schema\\.ts$',
      },
    },
    {
      name: 'presentation-uses-feature-public-api',
      severity: 'error',
      comment:
        'Feature presentation reaches other feature behavior through public module gates, not direct domain/application/transport/infrastructure internals.',
      from: { path: '^src/modules/(?!kernel/)([^/]+)/presentation(?:/|$)' },
      to: {
        path: '^src/modules/(?!kernel/)[^/]+/(?:domain|application|infrastructure|transport)(?:/|$)|^src/modules/(?!kernel/)[^/]+/factory\\.(?:ts|tsx)$',
        pathNot: '^src/modules/$1/',
      },
    },
    {
      name: 'presentation-no-infrastructure',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/presentation' },
      to: { path: '^src/modules/(?!kernel/)[^/]+/infrastructure' },
    },
    {
      name: 'infrastructure-no-presentation',
      severity: 'error',
      from: { path: '^src/modules/(book|user|genre|account)/infrastructure' },
      to: { path: '^src/modules/(book|user|genre|account)/presentation' },
    },
    {
      name: 'infrastructure-no-feature-presentation-or-transport',
      severity: 'error',
      comment:
        'Infrastructure adapters stay isolated from feature UI, protocol handlers, and public client/server entrypoints.',
      from: { path: '^src/modules/(?!kernel/)[^/]+/infrastructure' },
      to: {
        path: '^src/modules/(?!kernel/)[^/]+/(presentation|transport)(?:/|$)|^src/modules/(?!kernel/)[^/]+/(client|server|backend)\\.tsx?$',
      },
    },
    {
      name: 'infrastructure-no-cross-feature-infrastructure',
      severity: 'error',
      comment:
        'Feature infrastructure adapters do not import another feature infrastructure adapter; composition wires adapters together.',
      from: {
        path: '^src/modules/([^/]+)/infrastructure',
        pathNot: '^src/modules/kernel/',
      },
      to: {
        path: '^src/modules/(?!kernel/)[^/]+/infrastructure',
        pathNot:
          '^src/modules/$1/infrastructure|^src/modules/[^/]+/infrastructure/drizzle/schema\\.ts$',
      },
    },
    {
      name: 'transport-no-infrastructure',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/transport' },
      to: { path: '^src/modules/(?!kernel/)[^/]+/infrastructure' },
    },
    {
      name: 'transport-no-presentation',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/transport' },
      to: { path: '^src/modules/(?!kernel/)[^/]+/presentation' },
    },
    {
      name: 'server-entrypoints-no-feature-internals',
      severity: 'error',
      comment:
        'Server function entrypoints stay thin; use transport handlers and composition instead of feature internals.',
      from: {
        path: '^src/modules/[^/]+/(server|server-functions)\\.ts$',
        pathNot: '^src/modules/book/server\\.ts$',
      },
      to: {
        path: '^src/modules/(?!kernel/)[^/]+/(infrastructure|presentation)',
      },
    },
    {
      name: 'kernel-no-feature-imports',
      severity: 'error',
      from: {
        path: '^src/modules/kernel',
        pathNot:
          '^src/modules/kernel/infrastructure/db/schema/(index|relations)\\.ts$',
      },
      to: { path: '^src/modules/(?!kernel/)' },
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
          '^src/(composition|modules/[^/]+/infrastructure|modules/[^/]+/server\\.ts$|modules/[^/]+/testing\\.ts$|modules/kernel)',
      },
      to: {
        path: '^src/modules/(?!kernel/)[^/]+/infrastructure',
      },
    },
    {
      name: 'only-composition-imports-module-factory',
      severity: 'error',
      comment:
        'Module factory functions are wired by composition. Production callers use composed entry points.',
      from: {
        pathNot:
          '^src/(composition|modules/[^/]+/(index|testing)\\.ts|modules/[^/]+/.*\\.unit\\.(test|spec)\\.ts)',
      },
      to: {
        path: '^src/modules/[^/]+/factory\\.(ts|tsx)$',
      },
    },
    {
      name: 'testing-gates-only-for-tests',
      severity: 'error',
      comment:
        'testing.ts public gates expose owner internals for tests and must not be imported by production source.',
      from: {
        path: '^src',
        pathNot:
          '^src/(modules/[^/]+/testing\\.ts$|platform/runtime-config/testing\\.ts$)',
      },
      to: {
        path: '^src/(modules/[^/]+|platform/runtime-config)/testing\\.ts$',
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
        path: '^src/modules/[^/]+/(?!index\\.|presentation\\.|server\\.|backend\\.|client\\.|testing\\.)',
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
        'Better Auth SDK imports stay inside the auth-owned Better Auth adapter/facade.',
      from: {
        pathNot:
          '^src/modules/auth/(infrastructure/better-auth/|presentation/better-auth-client\\.ts$)',
      },
      to: { path: 'node_modules/better-auth/' },
    },
    {
      name: 'resend-sdk-confined',
      severity: 'error',
      comment: 'Resend SDK imports stay in the email Resend adapter.',
      from: {
        pathNot: '^src/modules/email/infrastructure/resend/',
      },
      to: { path: 'node_modules/resend/' },
    },
    {
      name: 'react-email-render-confined',
      severity: 'error',
      comment:
        'React Email rendering stays in email infrastructure or local email preview composition.',
      from: {
        pathNot:
          '^src/(modules/email/infrastructure/resend/|composition/email-preview\\.tsx$)',
      },
      to: { path: 'node_modules/@react-email/render/' },
    },
    {
      name: 'better-upload-server-confined',
      severity: 'error',
      comment:
        'Better Upload server SDK imports stay in upload infrastructure, upload transport, or composition.',
      from: {
        pathNot:
          '^src/(modules/kernel/infrastructure/storage/|modules/book/transport/upload/|composition/book-upload\\.ts$)',
      },
      to: { path: 'node_modules/@better-upload/server/' },
    },
    {
      name: 'better-upload-client-confined',
      severity: 'error',
      comment:
        'Better Upload client SDK imports stay in the shared upload UI components.',
      from: {
        pathNot: '^src/platform/components/(form/field-upload-input|upload)/',
      },
      to: { path: 'node_modules/@better-upload/client/' },
    },
    {
      name: 'sentry-sdk-confined',
      severity: 'error',
      comment:
        'Sentry SDK imports stay in app entrypoints and telemetry composition.',
      from: {
        pathNot:
          '^(instrument\\.server\\.mjs$|src/(server\\.ts$|start\\.ts$|composition/telemetry/sentry\\.(client|server)\\.ts$))',
      },
      to: { path: 'node_modules/@sentry/' },
    },
    {
      name: 'opentelemetry-sdk-confined',
      severity: 'error',
      comment: 'OpenTelemetry SDK imports stay in telemetry composition.',
      from: {
        pathNot: '^src/composition/telemetry/',
      },
      to: { path: 'node_modules/@opentelemetry/' },
    },
    {
      name: 'pino-forbidden',
      severity: 'error',
      comment: 'Pino is replaced by the OpenTelemetry-backed logger facade.',
      from: {},
      to: { path: 'node_modules/(pino|pino-pretty)/' },
    },
    {
      name: 'id-sdk-confined-to-kernel-infrastructure',
      severity: 'error',
      comment: 'ID generation SDK imports stay in kernel infrastructure.',
      from: {
        pathNot: '^src/modules/kernel/infrastructure/',
      },
      to: { path: 'node_modules/@paralleldrive/cuid2/' },
    },
    {
      name: 'workos-sdk-confined',
      severity: 'error',
      comment:
        'WorkOS SDK imports must stay inside the future auth-owned WorkOS adapter.',
      from: {
        pathNot: '^src/modules/auth/infrastructure/workos/',
      },
      to: { path: 'node_modules/@workos(?:-inc)?/' },
    },
    {
      name: 'legacy-server-entrypoints-removed',
      severity: 'error',
      from: {},
      to: { path: '^src/server/' },
    },
    {
      name: 'drizzle-confined-to-persistence-infrastructure',
      severity: 'error',
      comment:
        'Drizzle ORM imports stay in persistence infrastructure: kernel DB, module Drizzle adapters/schemas, and the auth Better Auth adapter.',
      from: {
        pathNot:
          '^src/(?:modules/kernel/infrastructure/db(?:/|$)|modules/[^/]+/infrastructure/drizzle(?:/|$)|modules/auth/infrastructure/better-auth(?:/|$))',
      },
      to: {
        path: '^(?:drizzle-orm(?:/|$)|better-auth/adapters/drizzle(?:/|$))',
      },
    },
    {
      name: 'database-drivers-confined-to-kernel-db',
      severity: 'error',
      comment:
        'Low-level database drivers are owned by kernel DB infrastructure.',
      from: {
        pathNot: '^src/modules/kernel/infrastructure/db(?:/|$)',
      },
      to: { path: '^(?:@neondatabase/serverless|pg|postgres)(?:/|$)' },
    },
    {
      name: 'server-only-from-client',
      severity: 'error',
      from: { path: '\\.client\\.(ts|tsx)$' },
      to: { path: '\\.server\\.(ts|tsx)$|^src/modules/[^/]+/infrastructure' },
    },
    {
      name: 'client-public-api-no-server-or-infrastructure',
      severity: 'error',
      comment:
        'Client public gates cannot import server entrypoints, server-only files, transport, or infrastructure.',
      from: {
        path: '^src/modules/(?!kernel/)[^/]+/client\\.tsx?$|^src/platform/runtime-config/client\\.tsx?$|\\.client\\.(ts|tsx)$',
      },
      to: {
        path: '^src/modules/[^/]+/(server|backend)\\.tsx?$|^src/modules/[^/]+/(infrastructure|transport)(?:/|$)|\\.server\\.(ts|tsx)$|^src/platform/env/server\\.ts$',
      },
    },
    {
      name: 'server-public-api-no-client-only',
      severity: 'error',
      comment:
        'Server public gates and server files cannot import client public gates or client-only files.',
      from: {
        path: '^src/modules/[^/]+/(server|backend)\\.tsx?$|\\.server\\.(ts|tsx)$|^src/server\\.ts$',
      },
      to: {
        path: '^src/modules/[^/]+/client\\.tsx?$|\\.client\\.(ts|tsx)$',
      },
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
