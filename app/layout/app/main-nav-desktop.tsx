import { Link, ValidateLinkOptions } from '@tanstack/react-router';
import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Logo } from '@/components/brand/logo';

import { MAIN_NAV_LINKS } from '@/layout/app/main-nav-config';

export const MainNavDesktop = () => {
  const { t } = useTranslation(['layout']);
  const HEIGHT = 'calc(56px + env(safe-area-inset-top))';
  return (
    <div className="hidden md:flex">
      <div
        style={{
          height: HEIGHT,
        }}
      />
      <header
        className="fixed top-0 right-0 left-0 flex items-center border-b border-b-neutral-200 bg-white pt-safe-top dark:border-b-neutral-800 dark:bg-neutral-900"
        style={{ height: HEIGHT }}
      >
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4">
          <Link to="/app">
            <Logo className="w-24" />
          </Link>
          <nav className="flex gap-0.5">
            {MAIN_NAV_LINKS.map(({ labelTranslationKey, ...item }) => (
              <Item key={item.linkOptions.to} {...item}>
                {t(labelTranslationKey)}
              </Item>
            ))}
          </nav>
        </div>
      </header>
    </div>
  );
};

const Item = (props: {
  linkOptions: ValidateLinkOptions;
  exact?: boolean;
  children?: ReactNode;
  icon: FC<{ className?: string }>;
  iconActive?: FC<{ className?: string }>;
}) => {
  const Icon = props.icon;
  const IconActive = props.iconActive ?? props.icon;
  return (
    <Link
      {...props.linkOptions}
      activeOptions={{
        exact: props.exact,
        ...props.linkOptions.activeOptions,
      }}
      className="flex items-center justify-center gap-2 rounded-md px-2.5 py-2 text-neutral-500 transition hover:bg-black/5 dark:text-neutral-400 dark:hover:bg-white/5 [&.active]:text-primary"
    >
      <Icon className="size-4 opacity-60 [.active_&]:hidden" />
      <IconActive className="hidden size-4 [.active_&]:block" />
      <span className="text-sm font-medium">{props.children}</span>
    </Link>
  );
};
