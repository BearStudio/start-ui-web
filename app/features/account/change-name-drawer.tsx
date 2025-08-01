import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearch } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  ResponsiveDrawer,
  ResponsiveDrawerBody,
  ResponsiveDrawerContent,
  ResponsiveDrawerDescription,
  ResponsiveDrawerFooter,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
  ResponsiveDrawerTrigger,
} from '@/components/ui/responsive-drawer';

import {
  FormFieldsAccountUpdateName,
  zFormFieldsAccountUpdateName,
} from '@/features/account/schema';
import { authClient } from '@/features/auth/client';

export const ChangeNameDrawer = (props: { children: ReactNode }) => {
  const { t } = useTranslation(['account']);
  const router = useRouter();
  const search = useSearch({ strict: false });
  const session = authClient.useSession();
  const form = useForm<FormFieldsAccountUpdateName>({
    resolver: zodResolver(zFormFieldsAccountUpdateName()),
    values: {
      name: session.data?.user.name ?? '',
    },
  });

  const updateUser = useMutation(
    orpc.account.updateInfo.mutationOptions({
      onSuccess: async () => {
        await session.refetch();
        toast.success(t('account:changeNameDrawer.successMessage'));
        form.reset();
        router.navigate({
          replace: true,
          to: '.',
          search: {
            state: '',
          },
        });
      },
      onError: () => toast.error(t('account:changeNameDrawer.errorMessage')),
    })
  );

  return (
    <ResponsiveDrawer
      open={search.state === 'change-name'}
      onOpenChange={(open) => {
        form.reset();
        router.navigate({
          replace: true,
          to: '.',
          search: {
            state: open ? 'change-name' : '',
          },
        });
      }}
    >
      <ResponsiveDrawerTrigger asChild>
        {props.children}
      </ResponsiveDrawerTrigger>

      <ResponsiveDrawerContent className="sm:max-w-xs">
        <Form
          {...form}
          onSubmit={async ({ name }) => {
            updateUser.mutate({ name });
          }}
          className="flex flex-col gap-4"
        >
          <ResponsiveDrawerHeader>
            <ResponsiveDrawerTitle>
              {t('account:changeNameDrawer.title')}
            </ResponsiveDrawerTitle>
            <ResponsiveDrawerDescription className="sr-only">
              {t('account:changeNameDrawer.description')}
            </ResponsiveDrawerDescription>
          </ResponsiveDrawerHeader>
          <ResponsiveDrawerBody>
            <FormField>
              <FormFieldLabel className="sr-only">
                {t('account:changeNameDrawer.label')}
              </FormFieldLabel>
              <FormFieldController
                control={form.control}
                type="text"
                name="name"
                size="lg"
                autoFocus
              />
            </FormField>
          </ResponsiveDrawerBody>
          <ResponsiveDrawerFooter>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={updateUser.isPending}
            >
              {t('account:changeNameDrawer.submitButton')}
            </Button>
          </ResponsiveDrawerFooter>
        </Form>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
};
