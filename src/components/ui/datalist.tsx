import { CircleAlertIcon, LucideRefreshCw, XIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export const DataList = ({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'relative flex w-full flex-col overflow-x-auto overflow-y-hidden rounded-sm border bg-white dark:bg-neutral-900',
        className
      )}
      {...props}
    />
  );
};

export const DataListRow = ({
  withHover,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { withHover?: boolean }) => {
  return (
    <div
      className={cn(
        'relative flex min-w-0 border-b px-1.5 transition duration-200 last:border-none',
        withHover && 'hover:bg-neutral-50 dark:hover:bg-white/5',
        className
      )}
      {...props}
    />
  );
};

export const DataListCell = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-col items-start justify-center px-1.5 py-2',
        className
      )}
      {...props}
    />
  );
};

export const DataListTextHeader = ({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('text-xs font-medium text-muted-foreground', className)}
      {...props}
    />
  );
};

export const DataListText = ({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn('max-w-full truncate text-sm', className)} {...props} />
  );
};

export const DataListLoadingState = () => {
  return (
    <>
      {[1, 0.75, 0.5].map((opacity) => (
        <DataListRow key={opacity} style={{ opacity }}>
          <DataListCell>
            <div className="flex w-full flex-col gap-2 p-2">
              <Skeleton className="h-2 w-1/3" />
              <Skeleton className="h-2 w-1/5" />
            </div>
          </DataListCell>
        </DataListRow>
      ))}
    </>
  );
};

export const DataListEmptyState = ({
  children,
  searchTerm,
  className,
}: {
  children?: ReactNode;
  searchTerm?: string;
  className?: string;
}) => {
  const { t } = useTranslation(['components']);
  return (
    <DataListRow className={cn('flex-1', className)}>
      <DataListCell className="flex-1 items-center justify-center py-4 text-sm text-muted-foreground">
        {searchTerm ? (
          <div>
            {t('components:datalist.noResultsTitle', {
              searchTerm,
            })}
          </div>
        ) : (
          (children ?? <div>{t('components:datalist.emptyTitle')}</div>)
        )}
      </DataListCell>
    </DataListRow>
  );
};

export const DataListErrorState = ({
  title,
  children,
  retry,
  className,
}: {
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  retry?: () => void;
}) => {
  const { t } = useTranslation(['components']);
  return (
    <DataListRow className={cn('flex-1', className)}>
      <DataListCell className="flex flex-col items-center justify-center py-4 text-center">
        <div className="flex w-full items-center justify-center gap-2 text-sm font-medium">
          <CircleAlertIcon className="size-4 text-muted-foreground" />
          {title ?? t('components:datalist.errorTitle')}
        </div>
        {(children || retry) && (
          <div className="flex w-full flex-col items-center gap-x-2 gap-y-1 text-muted-foreground">
            {!!children && <div className="text-sm">{children}</div>}
            {!!retry && (
              <Button variant="ghost" size="sm" onClick={retry}>
                <LucideRefreshCw />
                {t('components:datalist.retry')}
              </Button>
            )}
          </div>
        )}
      </DataListCell>
    </DataListRow>
  );
};

export const DataListRowResults = (props: {
  children?: ReactNode;
  className?: string;
  withClearButton?: boolean;
  onClear?: () => void;
}) => {
  const { t } = useTranslation(['components']);

  return (
    <DataListRow className={cn(props.className)}>
      <DataListCell className="py-1 pr-0">
        <div className="flex w-full items-center gap-1">
          <DataListText className="flex-1 text-xs text-muted-foreground">
            {props.children}
          </DataListText>
          {!!props.withClearButton && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                props.onClear?.();
              }}
            >
              <XIcon />
              {t('components:datalist.clear')}
            </Button>
          )}
        </div>
      </DataListCell>
    </DataListRow>
  );
};
