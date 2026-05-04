/** @type {import('@ladle/react').UserConfig} */
export default {
  stories: 'src/**/*.stories.{js,jsx,ts,tsx,mdx}',
  viteConfig: './vite.ladle.ts',
  addons: {
    a11y: {
      enabled: true,
    },
    theme: {
      enabled: true,
      defaultState: 'light',
    },
    rtl: {
      enabled: false,
    },
  },
};
