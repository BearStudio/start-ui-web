import { Link, useRouter } from '@tanstack/react-router';
import { RefreshCwIcon } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';

export function PageErrorBoundary({ error }: { error: Error }) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
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
          Try Again
        </Button>

        <Button asChild variant="secondary">
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              window.history.back();
            }}
          >
            Go Back
          </Link>
        </Button>
      </div>
    </div>
  );
}
