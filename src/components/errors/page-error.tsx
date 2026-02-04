import { HomeIcon, Undo2Icon } from 'lucide-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type ErrorCode =
  | '403'
  | '404'
  | 'error-boundary'
  | 'unknown-server-error'
  | 'unknown-auth-error'
  | 'unknown';

export const PageError = (props: {
  type: ErrorCode;
  title?: ReactNode;
  message?: ReactNode;
  children?: ReactNode;
  errorCode?: string;
}) => {
  const { t } = useTranslation(['components']);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
      <div className="flex flex-col items-center justify-center gap-x-4 gap-y-1 text-center md:flex-row">
        <h1 className="text-2xl leading-tight font-bold md:text-right md:text-lg">
          {props.title ??
            t(`components:pageError.${props.type}.title` as const)}
        </h1>
        <Separator orientation="vertical" className="hidden h-8 md:block" />

        <p className="text-sm text-muted-foreground md:text-left">
          {props.message ??
            t(`components:pageError.${props.type}.message` as const)}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4">
        {props.children ?? (
          <>
            <PageErrorButtonBack />
            <PageErrorButtonHome />
          </>
        )}
      </div>
      <div className="pt-4 font-mono text-xs text-muted-foreground uppercase opacity-60">
        {props.errorCode ?? props.type}
      </div>
    </div>
  );
};

export const PageErrorButtonBack = () => {
  const { t } = useTranslation(['components']);
  return (
    <Button
      variant="link"
      className="text-muted-foreground"
      onClick={(e) => {
        e.preventDefault();
        window.history.back();
      }}
      render={<a href="/" />}
      nativeButton={false}
    >
      <Undo2Icon className="opacity-60" />
      {t('components:pageError.goBack')}
    </Button>
  );
};
export const PageErrorButtonHome = () => {
  const { t } = useTranslation(['components']);
  return (
    <Button
      variant="link"
      className="text-muted-foreground"
      render={<a href="/" />}
      nativeButton={false}
    >
      <HomeIcon className="opacity-60" />
      {t('components:pageError.goHome')}
    </Button>
  );
};
