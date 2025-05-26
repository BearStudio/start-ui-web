import { defineConfig } from '@tanstack/react-start/config';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
    ],
  },
  server: {
    routeRules: {
      '/storybook': {
        redirect: {
          to: '/storybook/index.html',
          statusCode: 301,
        },
      },
    },
  },
});
