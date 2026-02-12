import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/tailwind/utils';

const labelVariants = cva(
  'flex items-baseline gap-1.5 text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-50'
);

function Label({
  className,
  ...props
}: React.ComponentProps<'label'> & VariantProps<typeof labelVariants>) {
  return (
    <label
      data-slot="label"
      className={cn(labelVariants(), className)}
      {...props}
    />
  );
}

export { Label };
