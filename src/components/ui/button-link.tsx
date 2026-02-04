import { Link, LinkProps } from '@tanstack/react-router';
import { ComponentProps } from 'react';

import { Button } from '@/components/ui/button';

type ButtonLinkProps = Pick<
  ComponentProps<typeof Button>,
  | 'className'
  | 'children'
  | 'variant'
  | 'size'
  | 'disabled'
  | 'loading'
  | 'onClick'
> &
  Omit<LinkProps, 'children'>;

function ButtonLink({
  // Button-specific props
  className,
  children,
  variant,
  size,
  disabled,
  loading,
  onClick,
  // Rest are Link props
  ...linkProps
}: ButtonLinkProps) {
  return (
    <Button
      className={className}
      variant={variant}
      size={size}
      disabled={disabled}
      loading={loading}
      onClick={onClick}
      nativeButton={false}
      render={<Link {...linkProps} disabled={disabled} />}
    >
      {children}
    </Button>
  );
}

export { ButtonLink };
