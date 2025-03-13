import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { Form } from '@/components/form';
import { Button } from '@/components/ui/button';

import {
  FormFieldsVerificationCode,
  zFormFieldsVerificationCode,
} from '@/features/auth/schemas';
import { VerificationCodeForm } from '@/features/auth/verification-code-form';

export default function PageLoginValidate({
  search,
}: {
  search: { token: string; email: string; redirect?: string };
}) {
  const { t } = useTranslation(['common']);
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<FormFieldsVerificationCode>({
    mode: 'onBlur',
    resolver: zodResolver(zFormFieldsVerificationCode()),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit: SubmitHandler<FormFieldsVerificationCode> = (values) => {
    validate.mutate({ ...values, token: search.token });
  };

  const validate = useMutation(
    orpc.auth.loginValidate.mutationOptions({
      onSuccess: (data) => {
        queryClient.clear();

        // Optimistic Update
        queryClient.setQueryData(
          orpc.auth.checkAuthenticated.key({ type: 'query' }),
          {
            isAuthenticated: true,
          }
        );

        if (search.redirect) {
          const redirectUrl = new URL(search.redirect);
          router.navigate({
            replace: true,
            to: redirectUrl.pathname,
            search: Object.fromEntries(redirectUrl.searchParams),
          });
          return;
        }

        if (data.account.authorizations.includes('ADMIN')) {
          router.navigate({
            replace: true,
            to: '/demo', // TODO redirect to admin
          });
          return;
        }

        router.navigate({
          replace: true,
          to: '/demo-2', // TODO redirect to app
        });
      },
      // onError: onVerificationCodeError, TODO handle errors with attemps
    })
  );

  return (
    <div className="flex flex-col gap-4">
      <Button size="sm" onClick={() => router.history.back()}>
        {t('common:actions.back')}
      </Button>

      <Form {...form} onSubmit={onSubmit}>
        <VerificationCodeForm
          email={search.email ?? ''}
          isLoading={validate.isPending || validate.isSuccess}
        />
      </Form>
    </div>
  );
}
