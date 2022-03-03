import { render } from '@testing-library/react';

import { Providers } from '@/Providers';

const CustomWrapper = ({ children }) => {
  return <Providers>{children}</Providers>;
};

const customRender = (ui, options?: TODO) =>
  render(ui, {
    wrapper: CustomWrapper,
    ...options,
  });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
