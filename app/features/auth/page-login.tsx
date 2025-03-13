import { Link, useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Inputs, Outputs } from '@/lib/orpc/types';

import { Button } from '@/components/ui/button';

import { LoginForm } from '@/features/auth/login-form';

export default function PageLogin() {
  const { t } = useTranslation(['auth', 'common']);
  const router = useRouter();

  const handleOnSuccess = (
    data: Outputs['auth']['login'],
    variables: Inputs['auth']['login']
  ) => {
    router.navigate({
      to: '/login/validate',
      search: {
        token: data.token,
        email: variables.email,
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl">{t('auth:login.appTitle')}</h1>
        <Button variant="link" size="sm" className="w-fit" asChild>
          <Link
            to="/" // TODO register link
          >
            <span className="text-muted-foreground">
              {t('auth:login.actions.noAccount')}
            </span>
            <span>{t('auth:login.actions.register')}</span>
          </Link>
        </Button>
      </div>

      {/* <OAuthLoginButtonsGrid /> TODO */}
      {/* <OAuthLoginDivider /> TODO */}

      <LoginForm onSuccess={handleOnSuccess} />
    </div>
  );
}
