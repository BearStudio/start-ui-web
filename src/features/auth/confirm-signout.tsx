import { useNavigate } from '@tanstack/react-router';
import { LogOutIcon } from 'lucide-react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';

export const ConfirmSignOut = (props: {
  children?: ReactElement<{ onClick: () => unknown }>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const { t } = useTranslation(['auth']);
  const navigate = useNavigate();
  return (
    <ConfirmResponsiveDrawer
      forceRenderOverlay
      open={props.open}
      onOpenChange={props.onOpenChange}
      onConfirm={() => {
        navigate({
          to: '/logout',
        });
      }}
      title={t('auth:signOut.confirm.title')}
      description={t('auth:signOut.confirm.description')}
      confirmText={
        <>
          <LogOutIcon />
          {t('auth:signOut.action')}
        </>
      }
    >
      {props.children}
    </ConfirmResponsiveDrawer>
  );
};
