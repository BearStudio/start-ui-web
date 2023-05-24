'use client';

import { useEffect, useState } from 'react';

import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { Loader } from '@/layout/Loader';

import { routes } from './routes';

export default function AppPage() {
  const [router, setRouter] =
    useState<ReturnType<typeof createBrowserRouter>>();

  useEffect(() => {
    setRouter(
      createBrowserRouter(routes, {
        basename: '/app',
        future: {
          v7_normalizeFormMethod: true,
        },
      })
    );
  }, []);

  if (!router) return <Loader />;

  return <RouterProvider router={router} />;
}
