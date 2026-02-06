import type { Meta } from '@storybook/react-vite';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { ReactNode, useMemo } from 'react';

import { ResponsiveIconButtonLink } from '@/components/ui/responsive-icon-button-link';

const RouterWrapper = ({ children }: { children: ReactNode }) => {
  const router = useMemo(() => {
    const rootRoute = createRootRoute({
      component: () => <>{children}</>,
    });
    const routeTree = rootRoute.addChildren([]);
    return createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });
  }, [children]);

  return <RouterProvider router={router} />;
};

export default {
  title: 'ResponsiveIconButtonLink',
  decorators: [(Story) => <RouterWrapper>{Story()}</RouterWrapper>],
} satisfies Meta<typeof ResponsiveIconButtonLink>;

export function Default() {
  return (
    <ResponsiveIconButtonLink to="/" label="Add">
      <PlusIcon />
    </ResponsiveIconButtonLink>
  );
}

export function Sizes() {
  return (
    <div className="flex gap-4">
      <ResponsiveIconButtonLink to="/" label="Add" size="sm">
        <PlusIcon />
      </ResponsiveIconButtonLink>
      <ResponsiveIconButtonLink to="/" label="Add" size="default">
        <PlusIcon />
      </ResponsiveIconButtonLink>
      <ResponsiveIconButtonLink to="/" label="Add" size="lg">
        <PlusIcon />
      </ResponsiveIconButtonLink>
    </div>
  );
}

export function Variants() {
  return (
    <div className="flex gap-4">
      <ResponsiveIconButtonLink to="/" label="Add">
        <PlusIcon />
      </ResponsiveIconButtonLink>
      <ResponsiveIconButtonLink to="/" label="Add" variant="secondary">
        <PlusIcon />
      </ResponsiveIconButtonLink>
      <ResponsiveIconButtonLink to="/" label="Add" variant="ghost">
        <PlusIcon />
      </ResponsiveIconButtonLink>
      <ResponsiveIconButtonLink to="/" label="Add" variant="destructive">
        <PlusIcon />
      </ResponsiveIconButtonLink>
      <ResponsiveIconButtonLink
        to="/"
        label="Add"
        variant="destructive-secondary"
      >
        <PlusIcon />
      </ResponsiveIconButtonLink>
      <ResponsiveIconButtonLink to="/" label="Add" variant="link">
        <PlusIcon />
      </ResponsiveIconButtonLink>
    </div>
  );
}
