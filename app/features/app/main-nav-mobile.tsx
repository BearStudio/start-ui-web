import { Link, ValidateLinkOptions } from '@tanstack/react-router';
import { FC, ReactNode } from 'react';

import { MAIN_NAV_LINKS } from '@/features/app/main-nav-config';

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
        className="fixed right-0 bottom-0 left-0 flex border-t border-t-neutral-100 bg-white px-4 pb-safe-bottom shadow-layout dark:border-t-neutral-800 dark:bg-neutral-900"
        style={{ height: HEIGHT }}
      >
        {MAIN_NAV_LINKS.map(({ label, ...item }) => (
          <Item key={item.linkOptions.to} {...item}>
            {label}
          </Item>
        ))}
      </div>
    </div>
  );
};

const Item = (props: {
  linkOptions: ValidateLinkOptions;
  exact?: boolean;
  children?: ReactNode;
  icon: FC<{ className?: string }>;
}) => {
  const Icon = props.icon;
  return (
    <Link
      {...props.linkOptions}
      activeOptions={{
        exact: props.exact,
        ...props.linkOptions.activeOptions,
      }}
      className="flex flex-1 flex-col items-center justify-center text-neutral-500 transition dark:text-neutral-400 [&.active]:text-neutral-800 dark:[&.active]:text-white"
    >
      <Icon className="size-5 opacity-60 transition [.active_&]:opacity-100" />
      <span className="text-2xs font-medium">{props.children}</span>
    </Link>
  );
};
