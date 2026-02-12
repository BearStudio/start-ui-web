import { ReactElement } from 'react';
import { userEvent } from 'vitest/browser';
import { ComponentRenderOptions, render } from 'vitest-browser-react';

import { Providers } from '@/providers';

const WithProviders = ({ children }: { children: React.ReactNode }) => {
  return <Providers>{children}</Providers>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<ComponentRenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: WithProviders, ...options });
};

// Custom Render
// https://testing-library.com/docs/react-testing-library/setup#custom-render
export * from 'vitest/browser';
export * from 'vitest-browser-react';

export { customRender as render };
export const setupUser = () => userEvent.setup();

export const FAILED_CLICK_TIMEOUT_MS = 200;
