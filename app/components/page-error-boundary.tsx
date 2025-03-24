import { Link, useRouter } from '@tanstack/react-router';
import { RefreshCwIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';

export function PageErrorBoundary({ error }: { error: Error }) {
  const router = useRouter();
  const { t } = useTranslation(['components']);
  const [isRetrying, setIsRetrying] = useState(false);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-xl font-bold">
        {t('components:pageErrorBoundary.title')}
      </h1>
      <pre
        className={cn(
          'max-h-44 w-full max-w-sm overflow-auto rounded-sm bg-neutral-900 p-4 text-xs text-wrap text-neutral-100',
          isRetrying && 'opacity-60'
        )}
      >
        <code>{error.message}</code>
      </pre>
      <div className="flex flex-wrap items-center gap-4">
        <Button
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

        <Button asChild variant="secondary">
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              window.history.back();
            }}
          >
            {t('components:pageErrorBoundary.goBack')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
