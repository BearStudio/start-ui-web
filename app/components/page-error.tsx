import { HomeIcon, Undo2Icon } from 'lucide-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export const PageError = (props: {
  error?: '403' | '404' | '500' | 'custom';
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) => {
  const { t } = useTranslation(['components']);

  return match(props.error)
    .with('403', () => (
      <PageErrorContent
        title={props.title ?? t('components:pageError.403.title')}
        description={
          props.description ?? t('components:pageError.403.description')
        }
        children={
          props.children ?? (
            <>
              <PageErrorButtonBack />
              <PageErrorButtonHome />
            </>
          )
        }
      />
    ))
    .with('404', () => (
      <PageErrorContent
        title={props.title ?? t('components:pageError.404.title')}
        description={
          props.description ?? t('components:pageError.404.description')
        }
        children={
          props.children ?? (
            <>
              <PageErrorButtonBack />
              <PageErrorButtonHome />
            </>
          )
        }
      />
    ))
    .with('500', undefined, () => (
      <PageErrorContent
        title={props.title ?? t('components:pageError.500.title')}
        description={
          props.description ?? t('components:pageError.500.description')
        }
        children={
          props.children ?? (
            <>
              <PageErrorButtonBack />
              <PageErrorButtonHome />
            </>
          )
        }
      />
    ))
    .with('custom', () => (
      <PageErrorContent
        title={props.title}
        description={props.description}
        children={props.children}
      />
    ))
    .exhaustive();
};

const PageErrorContent = (props: {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) => {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
      <div className="flex flex-col items-center justify-center gap-x-4 gap-y-1 text-center md:flex-row">
        <h1 className="text-2xl font-bold md:text-lg">{props.title}</h1>
        <Separator orientation="vertical" className="hidden h-8 md:block" />
        {!!props.description && (
          <p className="text-sm text-muted-foreground">{props.description}</p>
        )}
      </div>
      {!!props.children && (
        <div className="flex flex-wrap items-center justify-center gap-x-4">
          {props.children}
        </div>
      )}
    </div>
  );
};

export const PageErrorButtonBack = () => {
  const { t } = useTranslation(['components']);
  return (
    <Button asChild variant="link" className="text-muted-foreground">
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault();
          window.history.back();
        }}
      >
        <Undo2Icon className="opacity-60" />
        {t('components:pageError.goBack')}
      </a>
    </Button>
  );
};
export const PageErrorButtonHome = () => {
  const { t } = useTranslation(['components']);
  return (
    <Button asChild variant="link" className="text-muted-foreground">
      <a href="/">
        <HomeIcon className="opacity-60" />
        {t('components:pageError.goHome')}
      </a>
    </Button>
  );
};
