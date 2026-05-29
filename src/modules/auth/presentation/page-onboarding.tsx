import { useStore } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { LogOutIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  Form,
  FormField,
  FormFieldLabel,
  useAppForm,
} from '@/platform/components/form';
import { Button } from '@/platform/components/ui/button';

import { accountQueries } from '@/modules/account/client';
import {
  clearAllQueryStateForAuthBoundary,
  useAuthSession,
} from '@/modules/auth/client';
import { ConfirmSignOut } from '@/modules/auth/presentation/confirm-signout';
import { LayoutLogin } from '@/modules/auth/presentation/layout-login';
import { useMascot } from '@/modules/auth/presentation/mascot';
import { zFormFieldsOnboarding } from '@/modules/auth/presentation/schema';

export const PageOnboarding = () => {
  const { t } = useTranslation(['auth']);
  const session = useAuthSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const submitOnboarding = useMutation({
    ...accountQueries.submitOnboarding(),
    onSuccess: async (_, variables) => {
      toast.success(
        t('auth:pageOnboarding.successMessage', { name: variables.name })
      );
      // Refresh both Better Auth's client cache and the router-context
      // session cache, then invalidate route guards so beforeLoad reruns
      // and redirects the now-onboarded user out of /onboarding.
      await session.refetch();
      clearAllQueryStateForAuthBoundary(queryClient);
      await router.invalidate();
    },
    onError: () => {
      toast.error(t('auth:pageOnboarding.errorMessage'));
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: session.data?.user.name ?? '',
    },
    validators: { onSubmit: zFormFieldsOnboarding() },
    onSubmit: async ({ value }) => {
      await submitOnboarding.mutateAsync(value);
    },
  });

  const isInvalidAfterSubmit = useStore(
    form.store,
    (s) => s.isSubmitted && !s.isValid
  );
  useMascot({ isError: isInvalidAfterSubmit });

  return (
    <LayoutLogin
      footer={
        <div className="flex flex-col items-center justify-center text-center">
          <p className="pt-8 text-xs text-balance break-words text-muted-foreground">
            {t('auth:pageOnboarding.loggedWith', {
              email: session.data?.user.email,
            })}
          </p>
          <ConfirmSignOut>
            <Button size="xs" variant="link" className="opacity-80">
              <LogOutIcon />
              {t('auth:signOut.action')}
            </Button>
          </ConfirmSignOut>
        </div>
      }
    >
      <Form form={form} className="flex flex-col gap-4 pb-12">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-bold text-balance">
            {t('auth:pageOnboarding.title')}
          </h1>
          <p className="text-sm text-balance break-words text-muted-foreground">
            {t('auth:pageOnboarding.description')}
          </p>
        </div>

        <FormField>
          <FormFieldLabel>
            {t('auth:common.name.onboardingLabel')}
          </FormFieldLabel>
          <form.AppField name="name">
            {(field) => <field.FieldText type="text" size="lg" />}
          </form.AppField>
        </FormField>
        <Button
          type="submit"
          size="lg"
          loading={submitOnboarding.isPending || submitOnboarding.isSuccess}
        >
          {t('auth:pageOnboarding.submit')}
        </Button>
      </Form>
    </LayoutLogin>
  );
};
