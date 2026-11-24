import {
  ScrollArea as ScrollAreaPrimitive,
  ScrollAreaContent,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from '@ui-sdk/react/scroll-area';
import type * as React from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

function ScrollArea({
  className,
  children,
  orientation,
  type = 'auto',
  ...props
}: Omit<
  React.ComponentProps<typeof ScrollAreaPrimitive>,
  'className' | 'children'
> &
  Pick<React.ComponentProps<typeof ScrollAreaScrollbar>, 'orientation'> & {
    className?: string;
    children?: React.ReactNode;
  }) {
  const { i18n } = useTranslation();
  return (
    <ScrollAreaPrimitive
      dir={i18n.dir()}
      type={type}
      className={cn('relative', className)}
      {...props}
    >
      <ScrollAreaViewport className="flex size-full flex-1 flex-col rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1">
        <ScrollAreaContent className="flex min-h-full flex-col">
          {children}
        </ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollBar orientation={orientation} />
      <ScrollAreaCorner />
    </ScrollAreaPrimitive>
  );
}

function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: Omit<
  React.ComponentProps<typeof ScrollAreaScrollbar>,
  'className' | 'children'
> & { className?: string }) {
  return (
    <ScrollAreaScrollbar
      orientation={orientation}
      className={cn(
        'flex touch-none p-px opacity-0 transition-[opacity,background-color] select-none data-visible:opacity-100 data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent',
        className
      )}
      {...props}
    >
      <ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
