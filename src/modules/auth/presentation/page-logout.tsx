import { useTranslation } from 'react-i18next';

import { PageError } from '@/platform/components/errors/page-error';

export const PageLogout = () => {
  const { t } = useTranslation(['auth']);

  return (
    <PageError
      type="unknown-auth-error"
      title={t('auth:signOut.pageLogout.title')}
      message={t('auth:signOut.pageLogout.message')}
      errorCode="405"
    />
  );
};
