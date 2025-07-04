import { Link, useRouter } from '@tanstack/react-router';
import { HomeIcon, RefreshCwIcon, Undo2Icon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function PageErrorBoundary({ error }: { error: Error }) {
  const router = useRouter();
  const { t } = useTranslation(['components']);
  const [isRetrying, setIsRetrying] = useState(false);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
      <div className="flex flex-col items-center justify-center gap-x-4 gap-y-1 text-center md:flex-row">
        <h1 className="text-2xl font-bold md:text-xl">
          {t('components:pageErrorBoundary.title')}
        </h1>
        <div className="hidden h-8 md:block">
          <Separator orientation="vertical" />
        </div>
        <p className="text-sm text-muted-foreground">
          {t('components:pageErrorBoundary.description')}
        </p>
      </div>
      <pre
        className={cn(
          'max-h-44 w-full max-w-sm overflow-auto rounded-sm bg-neutral-900 p-4 text-xs text-wrap text-neutral-100',
          isRetrying && 'opacity-60'
        )}
      >
        <code>{error.message}</code>
      </pre>
      <div className="flex gap-4">
        <Button
          variant="link"
          disabled={isRetrying}
          onClick={() => {
            setIsRetrying(true);
            setTimeout(() => {
              router.invalidate();
            }, 600);
          }}
        >
          <RefreshCwIcon className={cn(isRetrying && 'animate-spin')} />
          {t('components:pageErrorBoundary.tryAgain')}
        </Button>
        <Button asChild variant="link" className="text-muted-foreground">
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              window.history.back();
            }}
          >
            <Undo2Icon className="opacity-60" />
            {t('components:pageErrorBoundary.goBack')}
          </Link>
        </Button>
        <Button asChild variant="link" className="text-muted-foreground">
          <Link to="/">
            <HomeIcon className="opacity-60" />
            {t('components:pageErrorBoundary.goHome')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
