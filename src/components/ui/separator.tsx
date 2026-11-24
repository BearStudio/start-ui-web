import { Separator as SeparatorPrimitive } from '@ui-sdk/react/separator';
import type * as React from 'react';

import { cn } from '@/lib/tailwind/utils';

// Vertical separators need an explicit height from the caller (e.g. `h-4`): a
// fixed height combined with `align-self: stretch` snaps the line to the top of a centered row.
function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: Omit<React.ComponentProps<typeof SeparatorPrimitive>, 'className'> & {
  className?: string;
}) {
  return (
    <SeparatorPrimitive
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px',
        className
      )}
      {...props}
    />
  );
}

export { Separator };
