import tailwindcss from '@tailwindcss/postcss';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
