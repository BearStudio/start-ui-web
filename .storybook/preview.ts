import type { Preview } from '@storybook/react';

import '@/styles/app.css';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    backgrounds: { disable: true, grid: { disable: true } },
  },
};

export default preview;
