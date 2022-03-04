import { FC, ReactElement } from 'react';

import { RenderOptions, render } from '@testing-library/react';

import { Providers } from '@/Providers';

const CustomWrapper: FC<{}> = ({ children }) => {
  return <Providers>{children}</Providers>;
};

const customRender = (ui: ReactElement, options: RenderOptions = {}) =>
  render(ui, {
    wrapper: CustomWrapper,
    ...options,
  });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
