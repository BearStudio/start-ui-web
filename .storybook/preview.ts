import type { Preview } from '@storybook/react';

import '@/styles/app.css';
import './preview.css';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    backgrounds: {
      disable: true,
      grid: { disable: true },
    },
    darkMode: {
      stylePreview: true,
    },
  },
};

export default preview;
