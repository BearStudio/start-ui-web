import { Link } from '@tanstack/react-router';
import { AlertCircleIcon, ArrowLeftIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

import { useMascot } from '@/features/auth/mascot';

export default function PageLoginError({
  search,
}: {
  search: { error?: string };
}) {
  useMascot({ initialState: 'error' });
  const { t } = useTranslation(['auth']);
  if (search.error === 'signup_disabled') {
    return (
      <Wrapper>
        <Alert>
          <AlertCircleIcon />
          <AlertTitle>
            {t('auth:pageLoginError.signup_disabled.title')}
          </AlertTitle>
          <AlertDescription>
            {t('auth:pageLoginError.signup_disabled.description')}
          </AlertDescription>
        </Alert>
      </Wrapper>
    );
  }
  if (search.error === 'access_denied') {
    return (
      <Wrapper>
        <Alert>
          <AlertCircleIcon />
          <AlertTitle>
            {t('auth:pageLoginError.access_denied.title')}
          </AlertTitle>
          <AlertDescription>
            {t('auth:pageLoginError.access_denied.description')}
          </AlertDescription>
        </Alert>
      </Wrapper>
    );
  }
  return (
    <Wrapper>
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>{t('auth:pageLoginError.unknown_error.title')}</AlertTitle>
        <AlertDescription>
          {t('auth:pageLoginError.unknown_error.description')}
        </AlertDescription>
      </Alert>
    </Wrapper>
  );
}

const Wrapper = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {children}
      <Button asChild variant="link">
        <Link to="/login">
          <ArrowLeftIcon />
          Back to login
        </Link>
      </Button>
    </div>
  );
};
