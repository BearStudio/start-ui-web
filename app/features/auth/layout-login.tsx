import { Link } from '@tanstack/react-router';
import { ReactNode } from 'react';

export const LayoutLogin = (props: { children?: ReactNode }) => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
            Start UI
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{props.children}</div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block"></div>
    </div>
  );
};
