import { Link } from '@tanstack/react-router';
import { ReactNode } from 'react';

import { Logo } from '@/components/brand/logo';

import image from './layout-login-image.jpg';

export const LayoutLogin = (props: { children?: ReactNode }) => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <Logo className="w-24" />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{props.children}</div>
        </div>
      </div>
      <div className="relative hidden items-center justify-center bg-muted lg:flex">
        <img
          src={image}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      </div>
    </div>
  );
};
