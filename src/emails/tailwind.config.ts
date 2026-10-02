import { pixelBasedPreset, type TailwindConfig } from 'react-email';

export const emailTailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
        code: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      colors: {
        white: '#ffffff',
        black: '#000000',
        canvas: '#f4f4f5',
        surface: '#fafafa',
        border: '#e4e4e7',
        text: '#18181b',
        'text-muted': '#52525b',
        primary: '#18181b',
      },
    },
  },
} satisfies TailwindConfig;
