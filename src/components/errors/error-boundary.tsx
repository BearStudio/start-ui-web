import { CheckIcon, CircleAlertIcon, CopyIcon } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';
import {
  ErrorBoundary as ReactErrorBoundary,
  FallbackProps,
} from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

import { useClipboard } from '@/hooks/use-clipboard';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  ResponsiveDrawer,
  ResponsiveDrawerBody,
  ResponsiveDrawerContent,
  ResponsiveDrawerDescription,
  ResponsiveDrawerFooter,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
  ResponsiveDrawerTrigger,
} from '@/components/ui/responsive-drawer';

const ErrorFallback = (props: FallbackProps) => {
  const { t } = useTranslation(['common', 'components']);
  const [open, setOpen] = useState(false);

  const { copyToClipboard, isCopied } = useClipboard();
  const errorMessage =
    !!props.error &&
    typeof props.error === 'object' &&
    'message' in props.error &&
    typeof props.error.message === 'string'
      ? props.error.message
      : null;

  return (
    <ResponsiveDrawer open={open} onOpenChange={setOpen}>
      <Alert
        variant="destructive"
        onClick={() => setOpen(true)}
        className="@container cursor-pointer border-none bg-negative-500/5"
      >
        <CircleAlertIcon className="size-4 @max-2xs:absolute @max-2xs:top-1/2 @max-2xs:left-1/2 @max-2xs:-translate-x-1/2 @max-2xs:-translate-y-1/2!" />
        <AlertTitle className="flex flex-wrap items-center gap-2 @max-2xs:opacity-0">
          <span className="line-clamp-1 flex-1">
            {t('components:errorBoundary.title')}
          </span>
          <ResponsiveDrawerTrigger
            render={<Button variant="secondary" size="xs" />}
          >
            {t('components:errorBoundary.details')}
          </ResponsiveDrawerTrigger>
        </AlertTitle>
        <AlertDescription className="line-clamp-1 font-mono text-xs text-muted-foreground! opacity-80 @max-2xs:hidden">
          {errorMessage}
        </AlertDescription>
      </Alert>
      <ResponsiveDrawerContent>
        <ResponsiveDrawerHeader>
          <ResponsiveDrawerTitle>
            {t('components:errorBoundary.title')}
          </ResponsiveDrawerTitle>
          <ResponsiveDrawerDescription className="text-xs">
            {t('components:errorBoundary.description')}
          </ResponsiveDrawerDescription>
        </ResponsiveDrawerHeader>
        <ResponsiveDrawerBody>
          <pre className="w-full rounded-md bg-muted p-4 font-mono text-xs break-words whitespace-pre-wrap text-muted-foreground">
            {errorMessage || t('components:errorBoundary.unknown')}
          </pre>
        </ResponsiveDrawerBody>
        <ResponsiveDrawerFooter>
          <Button
            variant="secondary"
            onClick={() =>
              copyToClipboard(
                errorMessage || t('components:errorBoundary.unknown')
              )
            }
          >
            {isCopied ? <CheckIcon /> : <CopyIcon />}
            {isCopied
              ? t('components:errorBoundary.copied')
              : t('components:errorBoundary.copyError')}
          </Button>
        </ResponsiveDrawerFooter>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
};

export const ErrorBoundary = (props: PropsWithChildren<unknown>) => {
  return <ReactErrorBoundary FallbackComponent={ErrorFallback} {...props} />;
};
