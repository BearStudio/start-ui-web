import { useStore } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { LogOutIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
  useForm,
} from '@/components/form';
import { Button } from '@/components/ui/button';

import { authClient } from '@/features/auth/client';
import { ConfirmSignOut } from '@/features/auth/confirm-signout';
import { LayoutLogin } from '@/features/auth/layout-login';
import { useMascot } from '@/features/auth/mascot';
import { zFormFieldsOnboarding } from '@/features/auth/schema';

export const PageOnboarding = () => {
  const { t } = useTranslation(['auth']);
  const session = authClient.useSession();

  const submitOnboarding = useMutation(
    orpc.account.submitOnboarding.mutationOptions({
      onSuccess: (_, variables) => {
        toast.success(
          t('auth:pageOnboarding.successMessage', { name: variables.name })
        );
        session.refetch();
      },
      onError: () => {
        toast.error(t('auth:pageOnboarding.errorMessage'));
      },
    })
  );

  const form = useForm({
    schema: zFormFieldsOnboarding(),
    defaultValues: {
      name: session.data?.user.name ?? '',
    },
    onSubmit: (values) => {
      submitOnboarding.mutate(values);
    },
  });

  const isError = useStore(form.store, (s) => !s.isValid && s.isSubmitted);
  useMascot({ isError });

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
          <FormFieldController type="text" form={form} name="name" size="lg" />
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
