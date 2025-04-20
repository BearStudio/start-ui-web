import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearch } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { useForm } from 'react-hook-form';

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

  return (
    <ResponsiveDrawer
      open={search.state === 'change-name'}
      onOpenChange={(open) =>
        router.navigate({
          replace: true,
          to: '.',
          search: {
            state: open ? 'change-name' : '',
          },
        })
      }
      autoFocus
    >
      <ResponsiveDrawerTrigger asChild>
        {props.children}
      </ResponsiveDrawerTrigger>

      <ResponsiveDrawerContent>
        <Form
          {...form}
          onSubmit={async ({ name }) => {
            // TODO Errors
            await authClient.updateUser({
              name,
            });
            form.reset();
            router.navigate({
              replace: true,
              to: '.',
              search: {
                state: '',
              },
            });
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
              />
            </FormField>
          </ResponsiveDrawerBody>
          <ResponsiveDrawerFooter>
            <Button type="submit" className="w-full">
              Update
            </Button>
          </ResponsiveDrawerFooter>
        </Form>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
};
