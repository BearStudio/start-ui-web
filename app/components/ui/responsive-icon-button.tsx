import { ReactNode } from '@tanstack/react-router';
import { ComponentProps } from 'react';

import { useIsMobile } from '@/hooks/use-mobile';

import { Button } from '@/components/ui/button';

export const ResponsiveIconButton = ({
  size,
  children,
  label,
  breakpoint,
  ...props
}: Omit<ComponentProps<typeof Button>, 'size' | 'children'> & {
  children: ReactNode;
  label: ReactNode;
  size?: 'sm' | 'default' | 'lg';
  breakpoint?: number;
}) => {
  const isMobile = useIsMobile(breakpoint);

  if (isMobile) {
    return (
      <Button
        {...props}
        size={!size || size === 'default' ? 'icon' : `icon-${size}`}
      >
        {children}
        <span className="sr-only">{label}</span>
      </Button>
    );
  }
  return (
    <Button size={size} {...props}>
      {children} <span>{label}</span>
    </Button>
  );
};
