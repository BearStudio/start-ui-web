import type { Meta } from '@storybook/react-vite';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { MailIcon } from 'lucide-react';
import { ReactNode, useMemo } from 'react';

import { ButtonLink } from '@/components/ui/button-link';

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
  title: 'ButtonLink',
  decorators: [(Story) => <RouterWrapper>{Story()}</RouterWrapper>],
} satisfies Meta<typeof ButtonLink>;

export const Default = () => {
  return <ButtonLink to="/">Default</ButtonLink>;
};

export const Variants = () => {
  return (
    <div className="flex gap-4">
      <ButtonLink to="/">Default</ButtonLink>
      <ButtonLink to="/" variant="secondary">
        Secondary
      </ButtonLink>
      <ButtonLink to="/" variant="destructive">
        Destructive
      </ButtonLink>
      <ButtonLink to="/" variant="destructive-secondary">
        Destructive
      </ButtonLink>
      <ButtonLink to="/" variant="ghost">
        Ghost
      </ButtonLink>
      <ButtonLink to="/" variant="link">
        Link
      </ButtonLink>
    </div>
  );
};

export const Sizes = () => {
  return (
    <div className="flex gap-4">
      <ButtonLink to="/" size="xs">
        Extra Small
      </ButtonLink>
      <ButtonLink to="/" size="sm">
        Small
      </ButtonLink>
      <ButtonLink to="/">Default</ButtonLink>
      <ButtonLink to="/" size="lg">
        Large
      </ButtonLink>
    </div>
  );
};

export const IconOnly = () => {
  return (
    <div className="flex gap-4">
      <ButtonLink to="/" size="icon-xs">
        <MailIcon />
      </ButtonLink>
      <ButtonLink to="/" size="icon-sm">
        <MailIcon />
      </ButtonLink>
      <ButtonLink to="/" size="icon">
        <MailIcon />
      </ButtonLink>
      <ButtonLink to="/" size="icon-lg">
        <MailIcon />
      </ButtonLink>
    </div>
  );
};

export const WithIcon = () => {
  return (
    <div className="flex gap-4">
      <ButtonLink to="/">
        <MailIcon />
        Button
      </ButtonLink>
      <ButtonLink to="/">
        Button
        <MailIcon />
      </ButtonLink>
    </div>
  );
};

export const FixedWidth = () => {
  return (
    <div className="flex gap-4">
      <ButtonLink to="/" className="w-32">
        <MailIcon />
        <span className="truncate">Button</span>
      </ButtonLink>
      <ButtonLink to="/" className="w-32">
        <MailIcon />
        <span className="truncate">Button with a long label</span>
      </ButtonLink>
      <ButtonLink to="/" className="w-32">
        <MailIcon />
        <span className="flex-1 truncate text-left">Button</span>
      </ButtonLink>
      <ButtonLink to="/" className="w-32">
        <MailIcon />
        <span className="flex-1 truncate text-left">
          Button with a long label
        </span>
      </ButtonLink>
      <ButtonLink to="/" className="w-32">
        <span className="flex-1 truncate text-left">Button</span>
        <MailIcon />
      </ButtonLink>
      <ButtonLink to="/" className="w-32">
        <span className="flex-1 truncate text-left">
          Button with a long label
        </span>
        <MailIcon />
      </ButtonLink>
    </div>
  );
};

export const Disabled = () => {
  return (
    <div className="flex gap-4">
      <ButtonLink to="/" disabled>
        Default
      </ButtonLink>
      <ButtonLink to="/" disabled variant="secondary">
        Secondary
      </ButtonLink>
      <ButtonLink to="/" disabled variant="destructive">
        Destructive
      </ButtonLink>
      <ButtonLink to="/" disabled variant="destructive-secondary">
        Destructive
      </ButtonLink>
      <ButtonLink to="/" disabled variant="ghost">
        Ghost
      </ButtonLink>
      <ButtonLink to="/" disabled variant="link">
        Link
      </ButtonLink>
    </div>
  );
};
