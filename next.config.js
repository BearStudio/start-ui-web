module.exports = {
  // https://github.com/vercel/next.js/issues/30330#issuecomment-952172377
  experimental: {
    esmExternals: false,
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
  async rewrites() {
    return [
      // Do not rewrite API routes
      {
        source: '/api/:any*',
        destination: '/api/:any*',
      },
      // Rewrite everything else to use `pages/app`
      {
        source: '/app/:any*',
        destination: '/app/',
      },
    ];
  },
};
