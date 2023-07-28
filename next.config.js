if (!process.env.SKIP_ENV_VALIDATIONS) {
  require('./.env.validator');
}

/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function defineNextConfig(config) {
  return config;
}

module.exports = defineNextConfig({
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
      // Rewrite app
      {
        source: '/app/:any*',
        destination: '/app/',
      },
    ];
  },
  experimental: {
    // This experimental configuration is useful to remove some SWC dependencies
    // from the final output. Those dependencies are included since Storybook v7
    // https://github.com/orgs/vercel/discussions/103#discussioncomment-6356642
    // https://nextjs.org/docs/app/api-reference/next-config-js/output#caveats
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
      ],
    },
  },
});
