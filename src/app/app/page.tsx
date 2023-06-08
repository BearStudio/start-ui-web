'use client';

import { useRef } from 'react';

import {
  RouterProvider,
  RouterProviderProps,
  createBrowserRouter,
} from 'react-router-dom';

import { useIsHydrated } from '@/hooks/useIsHydrated';
import { Loader } from '@/layout/Loader';

import { routes } from './routes';

export default function AppPage() {
  const routerRef = useRef<RouterProviderProps['router']>();
  const isHydrated = useIsHydrated();

  if (!routerRef.current && isHydrated) {
    routerRef.current = createBrowserRouter(routes, {
      basename: '/app',
      future: {
        v7_normalizeFormMethod: true,
      },
    });
  }

  if (!routerRef.current) return <Loader />;

  return <RouterProvider router={routerRef.current} />;
}
