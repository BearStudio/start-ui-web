await import('./src/env.mjs');

/** @type {import("next").NextConfig} */
const config = {
  async redirects() {
    return [
      {
        source: '/storybook',
        destination: '/storybook/index.html',
        permanent: true,
      },
    ];
  },
};

export default config;
