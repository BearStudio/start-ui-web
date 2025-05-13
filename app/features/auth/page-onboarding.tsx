import { useStore } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { LogOutIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { authClient } from '@/lib/auth/client';
import { useAppForm } from '@/lib/form/config';
import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';

import { ConfirmLogout } from '@/features/auth/confirm-logout';
import { LayoutLogin } from '@/features/auth/layout-login';
import { useMascot } from '@/features/auth/mascot';

export const PageOnboarding = () => {
  const { t } = useTranslation(['auth']);
  const session = authClient.useSession();

  const submitOnboarding = useMutation(
    orpc.account.submitOnboarding.mutationOptions({
      onSuccess: (_, variables) => {
        toast.success(`Welcome ${variables.name}`); // TODO translations
        session.refetch();
      },
      onError: () => {
        toast.error('Failed to finish onboarding'); // TODO translations
      },
    })
  );

  const form = useAppForm({
    defaultValues: {
      name: session.data?.user.name ?? '',
    },
  });

  const { isValid, isSubmitted } = useStore(form.store, (state) => ({
    isValid: state.isValid,
    isSubmitted: state.isSubmitted,
  }));
  useMascot({ isError: !isValid && isSubmitted });

  return (
    <LayoutLogin
      footer={
        <div className="flex flex-col items-center justify-center text-center">
          <p className="pt-8 text-xs text-balance break-words text-muted-foreground">
            {t('auth:pageOnboarding.loggedWith', {
              email: session.data?.user.email,
            })}
          </p>
          <ConfirmLogout>
            <Button size="xs" variant="link" className="opacity-80">
              <LogOutIcon />
              {t('auth:pageOnboarding.signOut')}
            </Button>
          </ConfirmLogout>
        </div>
      }
    >
      <form.Form className="flex flex-col gap-4 pb-12">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-bold text-balance">
            {t('auth:pageOnboarding.title')}
          </h1>
          <p className="text-sm text-balance break-words text-muted-foreground">
            {t('auth:pageOnboarding.description')}
          </p>
        </div>

        <form.AppField name="name">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>
                {t('auth:fields.name.onboardingLabel')}
              </field.FormFieldLabel>
              <field.FieldText size="lg" />
            </field.FormField>
          )}
        </form.AppField>
        <Button
          type="submit"
          size="lg"
          loading={submitOnboarding.isPending || submitOnboarding.isSuccess}
        >
          {t('auth:pageOnboarding.submit')}
        </Button>
      </form.Form>
    </LayoutLogin>
  );
};
