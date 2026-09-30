import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { MAIN_NAV_LINKS, NavLinkItem } from '@/layout/app/main-nav-config';

export const MainNavMobile = () => {
  const { t } = useTranslation(['layout']);
  return (
    <div className="md:hidden">
      <div className="h-main-nav-bottom" />
      <nav className="fixed right-0 bottom-0 left-0 flex h-main-nav-bottom border-t border-t-neutral-200 bg-white px-4 pb-safe-bottom dark:border-t-neutral-800 dark:bg-neutral-900">
        {MAIN_NAV_LINKS.map(({ labelTranslationKey, ...item }) => (
          <Item key={item.to} {...item}>
            {t(labelTranslationKey)}
          </Item>
        ))}
      </nav>
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
      className="flex flex-1 flex-col items-center justify-center text-neutral-500 dark:text-neutral-400 [&.active]:text-primary"
    >
      <ItemIcon className="size-6 opacity-60 in-[.active]:hidden" />
      <IconActive className="hidden size-6 in-[.active]:block" />
      <span className="text-2xs font-medium">{children}</span>
    </Link>
  );
};
