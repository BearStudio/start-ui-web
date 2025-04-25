import { ComponentProps, ReactElement, ReactNode } from 'react';

import { cloneAsChild } from '@/lib/clone-as-child';
import { cn } from '@/lib/tailwind/utils';
import { useIsMobile } from '@/hooks/use-mobile';

import { Button } from '@/components/ui/button';

export const ResponsiveIconButton = ({
  size = 'default',
  children,
  label,
  breakpoint,
  ...props
}: Omit<ComponentProps<typeof Button>, 'size' | 'children'> & {
  children: ReactElement<{ children?: ReactNode }>;
  label: ReactNode;
  size?: 'sm' | 'default' | 'lg';
  breakpoint?: number;
}) => {
  const isMobile = useIsMobile(breakpoint);
  const buttonIconSize =
    size === 'default' ? 'icon' : (`icon-${size}` as const);
  const buttonSize = isMobile ? buttonIconSize : size;

  return (
    <Button size={buttonSize} {...props}>
      {cloneAsChild({
        children,
        asChild: props.asChild,
        render: (child) => (
          <>
            {child} <span className={cn(isMobile && 'sr-only')}>{label}</span>
          </>
        ),
      })}
    </Button>
  );
};
