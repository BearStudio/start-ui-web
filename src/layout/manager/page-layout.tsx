import { ReactNode } from 'react';

import { cn } from '@/lib/tailwind/utils';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

export const PageLayoutContainer = (props: {
  children?: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-7xl min-w-0 flex-1 flex-col px-4',
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
  containerClassName?: string;
  endActions?: ReactNode;
  startActions?: ReactNode;
}) => {
  const { open, isMobile } = useSidebar();
  return (
    <header
      className={cn(
        'flex shrink-0 items-end border-b bg-white px-4 dark:bg-neutral-900',
        props.className
      )}
      style={{ height: TOPBAT_HEIGHT }}
    >
      <div className="flex h-14 min-w-0 flex-1 items-center gap-4 rtl:h-11">
        {(!open ||
          (isMobile && !props.startActions) ||
          !!props.startActions) && (
          <div className="flex items-center gap-3">
            {(!open || (isMobile && !props.startActions)) && (
              <>
                <SidebarTrigger className="-mx-1" />
                <Separator orientation="vertical" className="h-4" />
              </>
            )}
            {!!props.startActions && (
              <>
                <div className="-mx-1">{props.startActions}</div>
                <Separator orientation="vertical" className="h-4" />
              </>
            )}
          </div>
        )}
        <div
          className={cn(
            'flex min-w-24 flex-1 items-center gap-4',
            props.containerClassName
          )}
        >
          {props.children}
        </div>
        {!!props.endActions && (
          <div className="flex min-w-0 items-center gap-2">
            {props.endActions}
          </div>
        )}
      </div>
    </header>
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
