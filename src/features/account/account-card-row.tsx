import { ReactNode } from 'react';

import { cn } from '@/lib/tailwind/utils';

export const AccountCardRow = (props: {
  children?: ReactNode;
  label?: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'relative flex gap-x-4 gap-y-1.5 border-t px-4 py-4 text-sm max-sm:flex-col',
        props.className
      )}
    >
      <h5 className="w-48 flex-none font-medium max-sm:text-xs max-sm:text-muted-foreground">
        {props.label}
      </h5>
      <div className="flex min-w-0 flex-1 flex-col">{props.children}</div>
    </div>
  );
};
