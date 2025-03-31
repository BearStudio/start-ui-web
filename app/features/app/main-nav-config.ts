import { ReactNode, ValidateLinkOptions } from '@tanstack/react-router';
import { GitBranchIcon, HomeIcon, UserRoundIcon } from 'lucide-react';
import { FC } from 'react';

export const MAIN_NAV_LINKS = [
  {
    label: 'Home',
    icon: HomeIcon,
    linkOptions: {
      to: '/app',
    },
    exact: true,
  },
  {
    label: 'Repositories',
    icon: GitBranchIcon,
    linkOptions: {
      to: '/app/repository',
    },
  },
  {
    label: 'Account',
    icon: UserRoundIcon,
    linkOptions: {
      to: '/app/account',
    },
  },
] satisfies Array<{
  label: ReactNode;
  icon: FC<{ className?: string }>;
  linkOptions: ValidateLinkOptions;
  exact?: boolean;
}>;
