import { ReactNode, ValidateLinkOptions } from '@tanstack/react-router';
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
    label: 'Home',
    icon: IconHouseDuotone,
    iconActive: IconHouseFill,
    linkOptions: {
      to: '/app',
    },
    exact: true,
  },
  {
    label: 'Repositories',
    icon: IconGitBranchDuotone,
    iconActive: IconGitBranchFill,
    linkOptions: {
      to: '/app/repository',
    },
  },
  {
    label: 'Account',
    icon: IconUserCircleDuotone,
    iconActive: IconUserCircleFill,
    linkOptions: {
      to: '/app/account',
    },
  },
] satisfies Array<{
  label: ReactNode;
  icon: FC<{ className?: string }>;
  iconActive?: FC<{ className?: string }>;
  linkOptions: ValidateLinkOptions;
  exact?: boolean;
}>;
