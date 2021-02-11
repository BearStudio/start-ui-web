import React from 'react';

import { Providers } from '../src/Providers';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  backgrounds: {
    default: 'Light',
    values: [
      {
        name: 'Gray',
        value: '#F7FAFC',
      },
      {
        name: 'Light',
        value: '#ffffff',
      },
      {
        name: 'Dark',
        value: '#1A202C',
      },
    ],
  },
};

export const decorators = [
  (Story) => (
    <Providers>
      <Story />
    </Providers>
  ),
];
