module.exports = {
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
