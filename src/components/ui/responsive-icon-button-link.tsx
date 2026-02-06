import { ComponentProps, ReactNode } from 'react';
import { match } from 'ts-pattern';

import { cn } from '@/lib/tailwind/utils';
import { useIsMobile } from '@/hooks/use-mobile';

import { ButtonLink } from '@/components/ui/button-link';

export const ResponsiveIconButtonLink = ({
  label,
  size,
  breakpoint,
  children,
  ...props
}: Omit<ComponentProps<typeof ButtonLink>, 'size' | 'children'> & {
  children?: ReactNode;
  label: ReactNode;
  size?: 'xs' | 'sm' | 'default' | 'lg';
  breakpoint?: number;
}) => {
  const isMobile = useIsMobile(breakpoint);
  const buttonIconSize = match(size)
    .with('default', undefined, () => 'icon' as const)
    .with('xs', () => 'icon-xs' as const)
    .with('sm', () => 'icon-sm' as const)
    .with('lg', () => 'icon-lg' as const)
    .exhaustive();
  const buttonSize = isMobile ? buttonIconSize : size;

  return (
    <ButtonLink size={buttonSize} {...props}>
      {children}
      <span className={cn(isMobile && 'sr-only')}>{label}</span>
    </ButtonLink>
  );
};
