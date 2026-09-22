import { Separator as SeparatorPrimitive } from '@base-ui/react/separator';

import { cn } from '@/lib/tailwind/utils';

/**
 * Vertical separators need an explicit height from the caller (e.g. `h-4`):
 * `self-stretch` is not applied on purpose, because a fixed height combined
 * with `align-self: stretch` snaps the line to the top of a centered flex row.
 */
function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
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
