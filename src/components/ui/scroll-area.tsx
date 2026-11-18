import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

function ScrollArea({
  className,
  children,
  orientation,
  ...props
}: ScrollAreaPrimitive.Root.Props &
  Pick<ScrollAreaPrimitive.Scrollbar.Props, 'orientation'>) {
  const { i18n } = useTranslation();
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      dir={i18n.dir()}
      className={cn('relative', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="flex size-full flex-1 flex-col rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar orientation={orientation} />
      <ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = 'vertical',
  autoHide = false,
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props & {
  /** Shows only while the pointer is over the area or it scrolls. */
  autoHide?: boolean;
}) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        'flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent',
        autoHide &&
          'opacity-0 transition-opacity data-hovering:opacity-100 data-scrolling:opacity-100 motion-reduce:transition-none',
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border"
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollBar };
