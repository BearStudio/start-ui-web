import withPWAInit from '@ducanh2912/next-pwa';

await import('./src/env.mjs');

const withPWA = withPWAInit({
  dest: 'public',
  cacheStartUrl: false,
  // Disabled by default in dev so we do not have cache issues.
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import("next").NextConfig} */
const config = withPWA({
  images: {
    remotePatterns: [
      {
        hostname: 'raw.githubusercontent.com',
        pathname: '/BearStudio/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/storybook',
        destination: '/storybook/index.html',
        permanent: true,
      },
    ];
  },
});

export default config;
