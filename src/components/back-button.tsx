import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { ButtonLink } from '@/components/ui/button-link';

export const BackButton = ({
  children,
  to = '..',
  ...props
}: ComponentProps<typeof ButtonLink>) => {
  const { t } = useTranslation(['components']);
  const canGoBack = useCanGoBack();
  const router = useRouter();

  return (
    <ButtonLink
      variant="ghost"
      size="icon-sm"
      onClick={(e) => {
        if (canGoBack) {
          e.preventDefault();
          router.history.back();
        }
      }}
      to={to}
      {...props}
    >
      {children ?? (
        <>
          <ArrowLeftIcon className="rtl:rotate-180" />
          <span className="sr-only">{t('components:backButton.label')}</span>
        </>
      )}
    </ButtonLink>
  );
};
