import BoringAvatarComponent from 'boring-avatars';
import { Avatar as AvatarPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/tailwind/utils';

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        'relative flex size-8 shrink-0 overflow-hidden rounded-full',
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  );
}

function AvatarFallback(
  props: Omit<
    React.ComponentProps<typeof AvatarPrimitive.Fallback>,
    'children'
  > &
    StrictUnion<
      | {
          name: string;
          variant: 'initials';
        }
      | {
          name: string;
          variant: 'boring';
        }
      | {
          variant?: 'default' | undefined;
          children?: React.ReactNode;
        }
    >
) {
  if (props.variant === undefined || props.variant === 'default') {
    const { variant, children, className, ...rest } = props;

    return (
      <AvatarPrimitive.Fallback
        data-slot="avatar-fallback"
        className={cn(
          'flex size-full items-center justify-center rounded-full bg-black/5 text-xs uppercase dark:bg-white/10',
          className
        )}
        {...rest}
      >
        {children}
      </AvatarPrimitive.Fallback>
    );
  }

  if (props.variant === 'initials') {
    const { variant, name, className, ...rest } = props;
    return (
      <AvatarPrimitive.Fallback
        data-slot="avatar-fallback"
        className={cn(
          'flex size-full items-center justify-center rounded-full bg-black/5 text-xs uppercase dark:bg-white/10',
          className
        )}
        {...rest}
      >
        {name
          ?.split(' ')
          .slice(0, 2)
          .map((s) => s[0])
          .join('')}
      </AvatarPrimitive.Fallback>
    );
  }

  const { variant, name, className, ...rest } = props;
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full items-center justify-center rounded-full',
        className
      )}
      asChild
      {...rest}
    >
      <div>
        <BoringAvatarComponent
          variant="marble"
          name={name}
          className="size-full"
          colors={[
            '#FCD34D',
            '#F59E0B',
            '#FD6243',
            '#DF74EE',
            '#8364F4',
            '#6AB7E0',
            '#92EFCD',
            '#32CC91',
          ]}
        />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-black uppercase mix-blend-overlay">
          {name
            ?.split(' ')
            .slice(0, 2)
            .map((s) => s[0])
            .join('')}
        </span>
      </div>
    </AvatarPrimitive.Fallback>
  );
}

export { Avatar, AvatarFallback, AvatarImage };
