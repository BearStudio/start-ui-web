import { AlertCircleIcon, ArrowLeftIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ButtonLink } from '@/components/ui/button-link';

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
  const { t } = useTranslation(['auth']);
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {children}
      <ButtonLink variant="link" to="/login">
        <ArrowLeftIcon />
        {t('auth:pageLoginError.backToLogin')}
      </ButtonLink>
    </div>
  );
};
