import { Link } from '@tanstack/react-router';
import { HomeIcon } from 'lucide-react';
import { FC, ReactNode } from 'react';

import { FileRouteTypes } from '@/routeTree.gen';

const HEIGHT = 'calc(64px + env(safe-area-inset-bottom))';

export const MainNavMobile = () => {
  return (
    <div className="md:hidden">
      <div
        style={{
          height: HEIGHT,
        }}
      />
      <div
        className="fixed right-0 bottom-0 left-0 flex items-start border-t border-t-neutral-100 bg-white px-4 shadow-2xl dark:border-t-neutral-800 dark:bg-neutral-900"
        style={{ height: HEIGHT }}
      >
        <Item icon={HomeIcon} to="/">
          Home
        </Item>
        <Item icon={HomeIcon} to="/app">
          App
        </Item>
        <Item icon={HomeIcon} to="/manager">
          Manager
        </Item>
        <Item icon={HomeIcon} to="/login">
          Login
        </Item>
      </div>
    </div>
  );
};

const Item = (props: {
  to: FileRouteTypes['to'];
  exact?: boolean;
  children?: ReactNode;
  icon: FC<{ className?: string }>;
}) => {
  const Icon = props.icon;
  return (
    <Link
      to={props.to}
      activeOptions={{
        exact: props.exact,
      }}
      className="flex flex-1 flex-col items-center justify-center py-3 text-neutral-500 dark:text-neutral-400 [&.active]:text-neutral-800 dark:[&.active]:text-white"
    >
      <Icon className="opacity-80 [.active_&]:opacity-100" />
      <span className="text-2xs font-medium uppercase">{props.children}</span>
    </Link>
  );
};
