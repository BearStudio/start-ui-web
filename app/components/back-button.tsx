import { Link, useCanGoBack, useRouter } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

export const BackButton = ({
  children,
  linkProps,
  ...props
}: ComponentProps<typeof Button> & {
  linkProps?: Partial<Omit<ComponentProps<typeof Link>, 'children'>>;
}) => {
  const { t } = useTranslation(['components']);
  const canGoBack = useCanGoBack();
  const router = useRouter();

  return (
    <Button asChild variant="ghost" size="icon-sm" {...props}>
      <Link
        to=".."
        onClick={(e) => {
          if (canGoBack) {
            e.preventDefault();
            router.history.back();
          }
        }}
        {...linkProps}
      >
        {children ?? (
          <>
            <ArrowLeftIcon className="rtl:rotate-180" />
            <span className="sr-only">{t('components:backButton.label')}</span>
          </>
        )}
      </Link>
    </Button>
  );
};
