import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import BoringAvatarComponent from 'boring-avatars';
import * as React from 'react';

import { cn } from '@/lib/tailwind/utils';

function Avatar({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: 'default' | 'sm' | 'lg';
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        'group/avatar relative flex size-8 shrink-0 rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6',
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
      className={cn(
        'aspect-square size-full rounded-full object-cover',
        className
      )}
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
    const { variant: _, children, className, ...rest } = props;

    return (
      <AvatarPrimitive.Fallback
        data-slot="avatar-fallback"
        className={cn(
          'flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-2xs',
          className
        )}
        {...rest}
      >
        {children}
      </AvatarPrimitive.Fallback>
    );
  }

  if (props.variant === 'initials') {
    const { variant: _, name, className, ...rest } = props;
    return (
      <AvatarPrimitive.Fallback
        data-slot="avatar-fallback"
        className={cn(
          'flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground uppercase group-data-[size=sm]/avatar:text-2xs',
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

  const { variant: _, name, className, ...rest } = props;
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full items-center justify-center rounded-full',
        className
      )}
      {...rest}
    >
      <div className="relative size-full">
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
        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-black uppercase mix-blend-overlay group-data-[size=sm]/avatar:text-2xs">
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

function AvatarBadge({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        'absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background select-none',
        'group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden',
        'group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2',
        'group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2',
        className
      )}
      {...props}
    />
  );
}

function AvatarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        'group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background',
        className
      )}
      {...props}
    />
  );
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        'relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3',
        className
      )}
      {...props}
    />
  );
}

export {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
};
