import { Link, ValidateLinkOptions } from '@tanstack/react-router';
import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { MAIN_NAV_LINKS } from '@/layout/app/main-nav-config';

const HEIGHT = 'calc(64px + env(safe-area-inset-bottom))';

export const MainNavMobile = () => {
  const { t } = useTranslation(['layout']);
  return (
    <div className="md:hidden">
      <div
        style={{
          height: HEIGHT,
        }}
      />
      <nav
        className="fixed right-0 bottom-0 left-0 flex border-t border-t-neutral-200 bg-white px-4 pb-safe-bottom dark:border-t-neutral-800 dark:bg-neutral-900"
        style={{ height: HEIGHT }}
      >
        {MAIN_NAV_LINKS.map(({ labelTranslationKey, ...item }) => (
          <Item key={item.linkOptions.to} {...item}>
            {t(labelTranslationKey)}
          </Item>
        ))}
      </nav>
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
      className="flex flex-1 flex-col items-center justify-center text-neutral-500 dark:text-neutral-400 [&.active]:text-primary"
    >
      <Icon className="size-6 opacity-60 [.active_&]:hidden" />
      <IconActive className="hidden size-6 [.active_&]:block" />
      <span className="text-2xs font-medium">{props.children}</span>
    </Link>
  );
};
