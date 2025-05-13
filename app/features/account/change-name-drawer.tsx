import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearch } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { toast } from 'sonner';

import { authClient } from '@/lib/auth/client';
import { useAppForm } from '@/lib/form/config';
import { orpc } from '@/lib/orpc/client';

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

import { zFormFieldsAccountUpdateName } from '@/features/account/schema';

export const ChangeNameDrawer = (props: { children: ReactNode }) => {
  const router = useRouter();
  const search = useSearch({ strict: false });
  const session = authClient.useSession();
  const form = useAppForm({
    validators: { onSubmit: zFormFieldsAccountUpdateName() },
    defaultValues: {
      name: session.data?.user.name ?? '',
    },
    onSubmit: async ({ value }) => {
      updateUser.mutate({ name: value.name });
    },
  });

  const updateUser = useMutation(
    orpc.account.updateInfo.mutationOptions({
      onSuccess: async () => {
        await session.refetch();
        toast.success('Name updated');
        form.reset();
        router.navigate({
          replace: true,
          to: '.',
          search: {
            state: '',
          },
        });
      },
      onError: () => toast.error('Failed to update your name'),
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
        <form.AppForm>
          <form.Form className="flex flex-col gap-4">
            <ResponsiveDrawerHeader>
              <ResponsiveDrawerTitle>Update your name</ResponsiveDrawerTitle>
              <ResponsiveDrawerDescription className="sr-only">
                Form to update your name
              </ResponsiveDrawerDescription>
            </ResponsiveDrawerHeader>
            <ResponsiveDrawerBody>
              <form.AppField name="name">
                {(field) => (
                  <field.FormField>
                    <field.FormFieldLabel className="sr-only">
                      Name
                    </field.FormFieldLabel>
                    <field.FieldText size="lg" autoFocus />
                  </field.FormField>
                )}
              </form.AppField>
            </ResponsiveDrawerBody>
            <ResponsiveDrawerFooter>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={updateUser.isPending}
              >
                Update
              </Button>
            </ResponsiveDrawerFooter>
          </form.Form>
        </form.AppForm>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
};
