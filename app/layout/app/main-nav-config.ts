import { ValidateLinkOptions } from '@tanstack/react-router';
import { FC } from 'react';

import {
  IconGitBranchDuotone,
  IconGitBranchFill,
  IconHouseDuotone,
  IconHouseFill,
  IconUserCircleDuotone,
  IconUserCircleFill,
} from '@/components/icons/generated';

export const MAIN_NAV_LINKS = [
  {
    labelTranslationKey: 'layout:nav.home',
    icon: IconHouseDuotone,
    iconActive: IconHouseFill,
    linkOptions: {
      to: '/app',
    },
    exact: true,
  } as const,
  {
    labelTranslationKey: 'layout:nav.repositories',
    icon: IconGitBranchDuotone,
    iconActive: IconGitBranchFill,
    linkOptions: {
      to: '/app/repositories',
    },
  } as const,
  {
    labelTranslationKey: 'layout:nav.account',
    icon: IconUserCircleDuotone,
    iconActive: IconUserCircleFill,
    linkOptions: {
      to: '/app/account',
    },
  } as const,
] satisfies Array<{
  labelTranslationKey: string;
  icon: FC<{ className?: string }>;
  iconActive?: FC<{ className?: string }>;
  linkOptions: ValidateLinkOptions;
  exact?: boolean;
}>;
