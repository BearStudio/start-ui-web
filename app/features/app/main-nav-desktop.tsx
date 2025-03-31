import { Link, ValidateLinkOptions } from '@tanstack/react-router';
import { FC, ReactNode } from 'react';

import { Logo } from '@/components/brand/logo';

import { MAIN_NAV_LINKS } from '@/features/app/main-nav-config';

export const MainNavDesktop = () => {
  const HEIGHT = 'calc(56px + env(safe-area-inset-top))';
  return (
    <div className="hidden md:flex">
      <div
        style={{
          height: HEIGHT,
        }}
      />
      <div
        className="fixed top-0 right-0 left-0 flex items-center gap-4 border-b border-b-neutral-100 bg-white px-4 pt-safe-top shadow-layout dark:border-b-neutral-800 dark:bg-neutral-900"
        style={{ height: HEIGHT }}
      >
        <Logo className="w-24" />
        <div className="flex gap-2">
          {MAIN_NAV_LINKS.map(({ label, ...item }) => (
            <Item key={item.linkOptions.to} {...item}>
              {label}
            </Item>
          ))}
        </div>
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
      className="flex items-center justify-center gap-2 rounded-md px-2.5 py-1.5 text-neutral-500 transition hover:bg-black/5 dark:text-neutral-400 dark:hover:bg-white/5 [&.active]:text-primary"
    >
      <Icon className="size-4 opacity-60 transition [.active_&]:opacity-100" />
      <span className="text-sm font-medium transition">{props.children}</span>
    </Link>
  );
};
