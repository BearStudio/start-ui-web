import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearch } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { authClient } from '@/lib/auth/client';

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

export const ChangeNameDrawer = (props: { children: ReactNode }) => {
  const router = useRouter();
  const search = useSearch({ strict: false });
  const session = authClient.useSession();
  const form = useForm<FormFieldsAccountUpdateName>({
    resolver: zodResolver(zFormFieldsAccountUpdateName()),
    values: {
      name: session.data?.user.name ?? '',
    },
  });

  const updateUser = useMutation({
    mutationFn: async (variables: { name: string }) => {
      await authClient.updateUser({
        name: variables.name,
      });
      await session.refetch();
    },
    onSuccess: () => {
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
  });

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
          className="flex flex-col sm:gap-4"
        >
          <ResponsiveDrawerHeader>
            <ResponsiveDrawerTitle>Update your name</ResponsiveDrawerTitle>
            <ResponsiveDrawerDescription className="sr-only">
              Form to update your name
            </ResponsiveDrawerDescription>
          </ResponsiveDrawerHeader>
          <ResponsiveDrawerBody>
            <FormField>
              <FormFieldLabel className="sr-only">Name</FormFieldLabel>
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
              Update
            </Button>
          </ResponsiveDrawerFooter>
        </Form>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
};
