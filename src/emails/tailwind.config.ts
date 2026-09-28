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
        code: ['monospace'],
      },
      colors: {
        white: '#ffffff',
        black: '#000000',
        text: '#222222',
        'text-muted': '#666666',
        primary: '#18181b',
      },
    },
  },
} satisfies TailwindConfig;
