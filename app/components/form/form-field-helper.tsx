import { ComponentProps } from 'react';

import { cn } from '@/lib/tailwind/utils';

export const FormFieldHelper = ({
  className,
  ...props
}: ComponentProps<'div'>) => {
  return (
    <div
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    />
  );
};
