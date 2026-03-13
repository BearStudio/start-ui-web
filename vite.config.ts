import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react';
import cpy from 'cpy';
import { Nitro } from 'nitro/types';
import { nitro } from 'nitro/vite';
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';

const { nitroRetrieveServerDirHook, prismaCopyBinariesPlugin } =
  createPrismaCopyBinariesPlugin();

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      port: env.VITE_PORT ? Number(env.VITE_PORT) : 3000,
      strictPort: true,
    },
    plugins: [
      devtools(),
      tailwindcss(),
      tanstackStart(),
      nitro({
        modules: [
          (nitro) => {
            nitro.hooks.hook('build:before', () => {
              nitroRetrieveServerDirHook(nitro);
            });
          },
        ],
        routeRules: { '/storybook': { redirect: '/storybook/' } },
      }),
      // react's vite plugin must come after start's vite plugin
      viteReact(),
      babel({
        presets: [
          ['@babel/preset-react', { runtime: 'automatic' }],
          reactCompilerPreset(),
        ],
      }),
      // Copy prisma binaries at the end
      prismaCopyBinariesPlugin(),
    ],
  };
});

function createPrismaCopyBinariesPlugin() {
  let serverDir = '';
  return {
    nitroRetrieveServerDirHook: (nitro: Nitro) => {
      serverDir = nitro.options.output.serverDir.replace(resolve('.'), '.');
    },
    prismaCopyBinariesPlugin: () => ({
      name: 'prisma-copy-binaries',
      writeBundle: async (outputOptions: { dir?: string }) => {
        const outputDir = outputOptions.dir?.replace(resolve('.'), '.');
        if (outputDir === serverDir) {
          await cpy('./src/server/db/generated/**/*.node', resolve(serverDir));
        }
      },
    }),
  };
}
