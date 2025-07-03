import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';

const WithProviders = ({ children }: { children: React.ReactNode }) => {
  // [TODO]: Add providers once CI is properly set up.
  return children;
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
