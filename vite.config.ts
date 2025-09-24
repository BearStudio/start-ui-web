import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { codeInspectorPlugin } from 'code-inspector-plugin';
import { defineConfig, loadEnv } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    server: {
      port: env.VITE_PORT ? Number(env.VITE_PORT) : 3000,
      strictPort: true,
    },
    plugins: [
      devtools(),
      codeInspectorPlugin({
        bundler: 'vite',
      }),
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tanstackStart({
        customViteReactPlugin: true,
        tsr: {
          srcDirectory: 'app',
          routesDirectory: 'app/routes',
        },
      }),
      viteReact(),
    ],
  };
});
