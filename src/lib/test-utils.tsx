import React, { ReactElement } from 'react';

import { RenderOptions, cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach } from 'vitest';

import { Providers } from '@/app/Providers';

afterEach(cleanup);

const WithProviders = ({ children }: { children: React.ReactNode }) => {
  return <Providers>{children}</Providers>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: WithProviders, ...options });
};

export * from '@testing-library/react';
export { customRender as render };
export const setupUser = () => userEvent.setup();
