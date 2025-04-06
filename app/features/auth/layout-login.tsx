import { Link } from '@tanstack/react-router';
import { ReactNode } from 'react';

import { Logo } from '@/components/brand/logo';
import { LocalSwitcher } from '@/components/ui/local-switcher';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

import { useMascotState } from '@/features/auth/mascot';

import image from './layout-login-image.jpg';
import mascot from './mascot.png';
import mascotError from './mascot-error.png';

export const LayoutLogin = (props: {
  children?: ReactNode;
  footer?: ReactNode;
}) => {
  const mascotState = useMascotState();
  return (
    <div
      className="flex flex-1 bg-white pt-safe-top pb-safe-bottom dark:bg-neutral-950"
      data-testid="layout-login"
    >
      <div className="flex w-full flex-1 flex-col gap-4 p-6 max-md:overflow-hidden md:p-10">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <Logo className="w-24" />
          </Link>
          <div className="flex flex-wrap justify-end gap-x-4">
            <ThemeSwitcher iconOnly />
            <LocalSwitcher />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{props.children}</div>
        </div>
        {props.footer}
      </div>
      <div className="relative hidden w-full flex-1 items-center justify-center bg-muted lg:flex">
        <img
          src={image}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <img
          src={mascotState === 'error' ? mascotError : mascot}
          alt=""
          className="animate-float-in-space pointer-events-none absolute top-1/2 left-1/2 w-52 -translate-1/2"
        />
      </div>
    </div>
  );
};
