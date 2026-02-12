import { ComponentProps, ReactNode } from 'react';
import { match } from 'ts-pattern';

import { cn } from '@/lib/tailwind/utils';
import { useIsMobile } from '@/hooks/use-mobile';

import { Button } from '@/components/ui/button';

export const ResponsiveIconButton = ({
  size = 'default',
  children,
  label,
  breakpoint,
  ...props
}: Omit<ComponentProps<typeof Button>, 'size'> & {
  label: ReactNode;
  size?: 'xs' | 'sm' | 'default' | 'lg';
  breakpoint?: number;
}) => {
  const isMobile = useIsMobile(breakpoint);
  const buttonIconSize = match(size)
    .with('default', () => 'icon' as const)
    .with('xs', () => 'icon-xs' as const)
    .with('sm', () => 'icon-sm' as const)
    .with('lg', () => 'icon-lg' as const)
    .exhaustive();
  const buttonSize = isMobile ? buttonIconSize : size;

  return (
    <Button size={buttonSize} {...props}>
      {children}
      <span className={cn(isMobile && 'sr-only')}>{label}</span>
    </Button>
  );
};
