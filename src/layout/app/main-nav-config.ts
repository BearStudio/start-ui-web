import { linkOptions } from '@tanstack/react-router';

import {
  IconBookOpenDuotone,
  IconBookOpenFill,
  IconHouseDuotone,
  IconHouseFill,
  IconUserCircleDuotone,
  IconUserCircleFill,
} from '@/components/icons/generated';

export const MAIN_NAV_LINKS = linkOptions([
  {
    labelTranslationKey: 'layout:nav.home',
    icon: IconHouseDuotone,
    iconActive: IconHouseFill,
    to: '/app',
    activeOptions: { exact: true },
  },
  {
    labelTranslationKey: 'layout:nav.books',
    icon: IconBookOpenDuotone,
    iconActive: IconBookOpenFill,
    to: '/app/books',
  },
  {
    labelTranslationKey: 'layout:nav.account',
    icon: IconUserCircleDuotone,
    iconActive: IconUserCircleFill,
    to: '/app/account',
  },
]);

export type NavLinkItem = Omit<
  (typeof MAIN_NAV_LINKS)[number],
  'labelTranslationKey'
> & { children?: React.ReactNode };
