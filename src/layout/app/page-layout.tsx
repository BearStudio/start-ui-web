import { ReactNode } from 'react';

import { cn } from '@/lib/tailwind/utils';

import { ScrollArea } from '@/components/ui/scroll-area';

export const PageLayoutContainer = (props: {
  children?: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-4xl min-w-0 flex-1 flex-col px-4',
        props.className
      )}
    >
      {props.children}
    </div>
  );
};

const TOPBAT_HEIGHT =
  'calc(var(--page-layout-topbar-height, 56px) + env(safe-area-inset-top))';

export const PageLayoutTopBar = (props: {
  children?: ReactNode;
  className?: string;
  startActions?: ReactNode;
  endActions?: ReactNode;
  containerClassName?: string;
}) => {
  return (
    <div
      className={cn(
        'z-10 flex min-w-0 flex-col items-center justify-end overflow-hidden border-b border-b-neutral-200 bg-white pt-safe-top md:-mt-px md:[--page-layout-topbar-height:48px] dark:border-b-neutral-800 dark:bg-neutral-900',
        props.className
      )}
      style={{
        height: TOPBAT_HEIGHT,
      }}
    >
      <PageLayoutContainer
        className={cn('justify-end py-2', props.containerClassName)}
      >
        <div className="flex h-10 w-full min-w-0 items-center justify-center gap-4 pt-2">
          {!!props.startActions && (
            <div className="flex items-center gap-2">{props.startActions}</div>
          )}
          <div className="min-w-0 flex-1">{props.children}</div>
          {!!props.endActions && (
            <div className="flex items-center gap-2">{props.endActions}</div>
          )}
        </div>
      </PageLayoutContainer>
    </div>
  );
};

export const PageLayoutTopBarTitle = (props: {
  children?: ReactNode;
  className?: string;
}) => {
  return (
    <h1
      className={cn(
        'min-w-0 truncate text-base font-medium md:text-sm',
        props.className
      )}
    >
      {props.children}
    </h1>
  );
};

export const PageLayoutContent = (props: {
  noContainer?: boolean;
  children?: ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  return (
    <div className="relative flex flex-1 flex-col">
      <div className="absolute inset-0">
        <ScrollArea className="h-full">
          <div className={cn('flex flex-1 flex-col', props.className)}>
            {props.noContainer ? (
              props.children
            ) : (
              <PageLayoutContainer
                className={cn('py-4', props.containerClassName)}
              >
                {props.children}
              </PageLayoutContainer>
            )}
          </div>
          <div className="h-safe-bottom w-full" />
        </ScrollArea>
      </div>
    </div>
  );
};

export const PageLayout = (props: {
  children?: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('flex flex-1 flex-col', props.className)}>
      {props.children}
    </div>
  );
};
