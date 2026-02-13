import { CheckCircle2Icon, CopyIcon } from 'lucide-react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { useClipboard } from '@/hooks/use-clipboard';

import { Button } from '@/components/ui/button';
import {
  ResponsiveDrawer,
  ResponsiveDrawerBody,
  ResponsiveDrawerContent,
  ResponsiveDrawerDescription,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
  ResponsiveDrawerTrigger,
} from '@/components/ui/responsive-drawer';

import { BuildInfoVersion } from '@/features/build-info/build-info-version';

import buildInfo from './build-info.gen.json';

export const BuildInfoDrawer = ({
  children,
  nativeButtonTrigger = true,
}: {
  children?: ReactElement;
  nativeButtonTrigger?: boolean;
}) => {
  const { t } = useTranslation(['buildInfo']);
  const { copyToClipboard, isCopied } = useClipboard();

  return (
    <ResponsiveDrawer>
      {children && (
        <ResponsiveDrawerTrigger
          nativeButton={nativeButtonTrigger}
          render={children}
        />
      )}
      <ResponsiveDrawerContent forceRenderOverlay>
        <ResponsiveDrawerHeader className="gap-2 text-center">
          <ResponsiveDrawerTitle>
            <BuildInfoVersion />
          </ResponsiveDrawerTitle>
          <ResponsiveDrawerDescription className="flex min-h-6 items-center">
            {isCopied ? (
              <span className="flex items-center gap-1 rounded-md bg-positive-100 px-1.5 py-1 text-xs font-medium text-positive-800 max-sm:mx-auto dark:bg-positive-600/30 dark:text-positive-100">
                <CheckCircle2Icon className="size-3" />{' '}
                {t('buildInfo:copiedToClipboard')}
              </span>
            ) : (
              <Button
                size="xs"
                variant="secondary"
                className="max-sm:mx-auto"
                onClick={() =>
                  copyToClipboard(JSON.stringify(buildInfo, null, 2))
                }
              >
                <CopyIcon />
                {t('buildInfo:copyToClipboard')}
              </Button>
            )}
          </ResponsiveDrawerDescription>
        </ResponsiveDrawerHeader>
        <ResponsiveDrawerBody className="min-w-0 pb-8">
          <div className="flex flex-col">
            {Object.entries(buildInfo).map(([key, value]) => {
              if (key === 'display') return null;
              return (
                <div
                  key={key}
                  className="flex border-b py-2 text-sm first:border-t"
                >
                  <div className="w-24 font-medium text-muted-foreground capitalize">
                    {key}
                  </div>
                  <div className="min-w-0 flex-1 font-mono break-words">
                    {value}
                  </div>
                </div>
              );
            })}
          </div>
        </ResponsiveDrawerBody>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
};
