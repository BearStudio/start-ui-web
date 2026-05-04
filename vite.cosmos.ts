import babel from '@rolldown/plugin-babel';
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  process.env.VITE_BASE_URL ??= env.VITE_BASE_URL ?? 'http://localhost:3000';
  process.env.VITE_S3_BUCKET_PUBLIC_URL ??=
    env.VITE_S3_BUCKET_PUBLIC_URL ?? 'http://localhost:9000/public';

  return {
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [viteReact(), babel({ presets: [reactCompilerPreset()] })],
  };
});
