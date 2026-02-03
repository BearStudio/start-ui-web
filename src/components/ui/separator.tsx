import { Separator as SeparatorPrimitive } from '@base-ui/react/separator';

import { cn } from '@/lib/tailwind/utils';

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
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-auto w-[1px]',
        className
      )}
      {...props}
    />
  );
}

export { Separator };
