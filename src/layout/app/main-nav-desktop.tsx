import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Logo } from '@/components/brand/logo';

import { MAIN_NAV_LINKS, NavLinkItem } from '@/layout/app/main-nav-config';

export const MainNavDesktop = () => {
  const { t } = useTranslation(['layout']);
  return (
    <div className="hidden md:flex">
      <div className="h-main-nav-top" />
      <header className="fixed top-0 right-0 left-0 flex h-main-nav-top items-center border-b border-b-neutral-200 bg-white pt-safe-top dark:border-b-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4">
          <Link to="/app">
            <Logo className="w-24" />
          </Link>
          <nav className="flex gap-0.5">
            {MAIN_NAV_LINKS.map(({ labelTranslationKey, ...item }) => (
              <Item key={item.to} {...item}>
                {t(labelTranslationKey)}
              </Item>
            ))}
          </nav>
        </div>
      </header>
    </div>
  );
};

const Item = ({
  icon: ItemIcon,
  iconActive,
  children,
  ...linkProps
}: NavLinkItem) => {
  const IconActive = iconActive ?? ItemIcon;
  return (
    <Link
      {...linkProps}
      className="flex items-center justify-center gap-2 rounded-md px-2.5 py-2 text-neutral-500 transition hover:bg-black/5 dark:text-neutral-400 dark:hover:bg-white/5 [&.active]:text-primary"
    >
      <ItemIcon className="size-4 opacity-60 in-[.active]:hidden" />
      <IconActive className="hidden size-4 in-[.active]:block" />
      <span className="text-sm font-medium">{children}</span>
    </Link>
  );
};
