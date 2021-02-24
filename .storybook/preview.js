import React from 'react';

import { BrowserRouter } from 'react-router-dom';

import { Providers } from '../src/Providers';

export const parameters = {
  options: {
    storySort: {
      order: ['StyleGuide', 'Components', 'Fields', 'App Layout'],
    },
  },
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
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    </Providers>
  ),
];
