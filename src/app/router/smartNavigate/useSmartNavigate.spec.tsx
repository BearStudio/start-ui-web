import { renderHook } from '@testing-library/react-hooks';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { useSmartNavigate } from '@/app/router/smartNavigate';
import { SmartNavigateState } from '@/app/router/smartNavigate/useSmartNavigate';

const wrapperRouter = ({ children }: any) => <MemoryRouter>{children}</MemoryRouter>;

describe('useSmartNavigate', () => {
  it('Should navigate with from state', async () => {
    const { result } = renderHook(
      () => {
        const smartNavigate = useSmartNavigate();
        const location = useLocation();

        return { smartNavigate, location };
      },
      {
        wrapper: wrapperRouter,
      }
    );

    result.current.smartNavigate.smartNavigate('/test');

    expect(result.current.location.pathname).toBe('/test');
    expect((result.current.location.state as SmartNavigateState).from).toBe('/');
  });

  it('Should navigate and goBack to from url', async () => {
    const { result } = renderHook(
      () => {
        const smartNavigate = useSmartNavigate();
        const location = useLocation();

        return { smartNavigate, location };
      },
      {
        wrapper: wrapperRouter,
      }
    );

    result.current.smartNavigate.smartNavigate('/test');
    result.current.smartNavigate.smartGoBack('/fallback');

    expect(result.current.location.pathname).toBe('/');
  });

  it('Should goBack to fallback url', async () => {
    const { result } = renderHook(
      () => {
        const smartNavigate = useSmartNavigate();
        const location = useLocation();

        return { smartNavigate, location };
      },
      {
        wrapper: wrapperRouter,
      }
    );

    result.current.smartNavigate.smartGoBack('/fallback');

    expect(result.current.location.pathname).toBe('/fallback');
  });
});
