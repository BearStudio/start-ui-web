import { ReactElement } from 'react';

import { RenderOptions, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Providers } from '@/app/Providers';

const WithProviders = ({ children }: { children: React.ReactNode }) => {
  return <Providers>{children}</Providers>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: WithProviders, ...options });
};

// Custom Render
// https://testing-library.com/docs/react-testing-library/setup#custom-render
export * from '@testing-library/react';
export { customRender as render };
export const setupUser = () => userEvent.setup();
