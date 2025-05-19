import { useCopyToClipboard } from '@uidotdev/usehooks';
import { CheckCircle2Icon, CopyIcon } from 'lucide-react';
import { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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

export const BuildInfoDrawer = (props: { children: ReactElement }) => {
  const { t } = useTranslation(['buildInfo']);
  const [, copyToClipboard] = useCopyToClipboard();
  const [showFeedback, setShowFeedback] = useState(false);

  const copy = () => {
    setShowFeedback(true);
    copyToClipboard(JSON.stringify(buildInfo, null, 2));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFeedback(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [showFeedback]);

  return (
    <ResponsiveDrawer>
      <ResponsiveDrawerTrigger asChild>
        {props.children}
      </ResponsiveDrawerTrigger>
      <ResponsiveDrawerContent>
        <ResponsiveDrawerHeader className="gap-2 text-center">
          <ResponsiveDrawerTitle>
            <BuildInfoVersion />
          </ResponsiveDrawerTitle>
          <ResponsiveDrawerDescription className="flex min-h-6 items-center">
            {showFeedback ? (
              <span className="flex items-center gap-1 rounded-md bg-positive-100 px-1.5 py-1 text-xs font-medium text-positive-800 max-sm:mx-auto dark:bg-positive-600/30 dark:text-positive-100">
                <CheckCircle2Icon className="size-3" />{' '}
                {t('buildInfo:copiedToClipboard')}
              </span>
            ) : (
              <Button
                size="xs"
                variant="secondary"
                className="max-sm:mx-auto"
                onClick={() => copy()}
              >
                <CopyIcon />
                {t('buildInfo:copyToClipboard')}
              </Button>
            )}
          </ResponsiveDrawerDescription>
        </ResponsiveDrawerHeader>
        <ResponsiveDrawerBody className="min-w-0">
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
