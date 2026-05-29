import babel from '@rolldown/plugin-babel';
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { defineConfig, loadEnv } from 'vite';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const rootIndexHtmlPath = path.join(rootDir, 'index.html');
const cosmosIndexHtmlPath = path.join(rootDir, 'tools/cosmos/index.html');
const cosmosExportPath = path.join(rootDir, 'cosmos-export');

function cosmosIndexHtmlPlugin(): Plugin {
  return {
    name: 'cosmos-index-html',
    enforce: 'pre',
    resolveId(id) {
      if (path.resolve(rootDir, id) === rootIndexHtmlPath) {
        return cosmosIndexHtmlPath;
      }

      return null;
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split('?')[0];

        if (pathname !== '/' && pathname !== '/index.html') {
          next();
          return;
        }

        try {
          // SECURITY: This React Cosmos middleware only serves the fixed
          // repo-local renderer template for the exact root HTML routes during
          // local Vite development, so the filesystem path is not
          // request-controlled and this is not a production endpoint that
          // needs external traffic rate limiting.
          const html = readFileSync(cosmosIndexHtmlPath, 'utf8');
          // SECURITY: Only the allowlisted pathname above is passed as Vite
          // transform context for dev-time asset/HMR rewriting; query strings
          // and other request input are not concatenated into the HTML returned
          // below.
          const transformedHtml = await server.transformIndexHtml(
            pathname,
            html
          );

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html');
          res.end(transformedHtml);
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

function cosmosExportHtmlPlugin(): Plugin {
  return {
    name: 'cosmos-export-html',
    closeBundle() {
      const generatedHtmlPath = path.join(
        cosmosExportPath,
        'tools/cosmos/index.html'
      );
      const rootHtmlPath = path.join(cosmosExportPath, 'index.html');

      if (existsSync(generatedHtmlPath)) {
        const html = readFileSync(generatedHtmlPath, 'utf8').replaceAll(
          '../../assets/',
          'assets/'
        );

        mkdirSync(path.dirname(rootHtmlPath), { recursive: true });
        writeFileSync(rootHtmlPath, html);
        rmSync(path.join(cosmosExportPath, 'tools'), {
          recursive: true,
          force: true,
        });
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  process.env.VITE_BASE_URL ??= env.VITE_BASE_URL ?? 'http://localhost:3000';
  process.env.VITE_S3_BUCKET_PUBLIC_URL ??=
    env.VITE_S3_BUCKET_PUBLIC_URL ?? 'http://localhost:9000/public';

  return {
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      cosmosIndexHtmlPlugin(),
      cosmosExportHtmlPlugin(),
      viteReact(),
      babel({ presets: [reactCompilerPreset()] }),
    ],
  };
});
