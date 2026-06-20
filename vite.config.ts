import babel from '@rolldown/plugin-babel';
import { sentryTanstackStart } from '@sentry/tanstackstart-react/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';

import { CSP_NONCE_PLACEHOLDER } from './src/platform/http/csp-nonce';

function srcJsonImportPlugin(): Plugin {
  return {
    name: 'start-ui:src-json-import',
    apply: 'serve',
    configureServer(server) {
      const srcDir = path.resolve(server.config.root, 'src');

      server.middlewares.use(async (req, res, next) => {
        if (!req.url) {
          next();
          return;
        }

        const url = new URL(req.url, 'http://localhost');
        const isSrcJsonImport =
          url.pathname.startsWith('/src/') &&
          url.pathname.endsWith('.json') &&
          url.searchParams.has('import');

        if (!isSrcJsonImport) {
          next();
          return;
        }

        let decodedPathname: string;

        try {
          decodedPathname = decodeURIComponent(url.pathname);
        } catch {
          next();
          return;
        }

        const filePath = path.resolve(
          server.config.root,
          `.${decodedPathname}`
        );

        if (!filePath.startsWith(`${srcDir}${path.sep}`)) {
          next();
          return;
        }

        try {
          const source = await readFile(filePath, 'utf8');
          res.setHeader('Content-Type', 'text/javascript');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(
            `const data = JSON.parse(${JSON.stringify(source)});\nexport default data;\n`
          );
        } catch {
          next();
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const sentryEnv = loadEnv(mode, process.cwd(), 'SENTRY_');
  const envName = env.VITE_ENV_NAME?.toLowerCase();
  const isTestRuntime = envName === 'test' || envName === 'tests';
  const sentryPlugins =
    env.VITE_SENTRY_DSN &&
    sentryEnv.SENTRY_ORG &&
    sentryEnv.SENTRY_PROJECT &&
    sentryEnv.SENTRY_AUTH_TOKEN
      ? sentryTanstackStart({
          org: sentryEnv.SENTRY_ORG,
          project: sentryEnv.SENTRY_PROJECT,
          authToken: sentryEnv.SENTRY_AUTH_TOKEN,
        })
      : [];

  return {
    build: {
      target: 'baseline-widely-available',
    },
    html: {
      cspNonce: CSP_NONCE_PLACEHOLDER,
    },
    server: {
      port: env.VITE_PORT ? Number(env.VITE_PORT) : 3000,
      strictPort: true,
    },
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      ...(isTestRuntime ? [] : devtools()),
      srcJsonImportPlugin(),
      tanstackStart(),
      nitro(),
      // react's vite plugin must come after start's vite plugin
      viteReact(),
      babel({ presets: [reactCompilerPreset()] }),
      ...sentryPlugins,
    ],
  };
});
