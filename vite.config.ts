import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig, loadEnv } from 'vite';

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
        // Redirect to index.html, not '/storybook/': route rules ignore the
        // trailing slash, so '/storybook/' would match again and loop
        routeRules: { '/storybook': { redirect: '/storybook/index.html' } },
      }),
      // react's vite plugin must come after start's vite plugin
      // React Compiler through oxc-transform-react (Rust port, experimental)
      viteReact({ compiler: true }),
    ],
  };
});
