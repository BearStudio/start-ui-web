import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearch } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { useForm } from 'react-hook-form';

import { authClient } from '@/lib/auth/client';
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
  FormFieldsAccountChangeEmail,
  zFormFieldsAccountChangeEmail,
} from '@/features/account/schema';

export const ChangeEmailInitDrawer = (props: { children: ReactNode }) => {
  const router = useRouter();
  const search = useSearch({ strict: false });
  const session = authClient.useSession();

  const changeEmailInit = useMutation(
    orpc.account.changeEmailInit.mutationOptions({
      onSuccess: () => {
        // TODO handle next screen
        form.reset();
      },
      onError: () => {
        // TODO Handle errors
      },
    })
  );

  const form = useForm<FormFieldsAccountChangeEmail>({
    resolver: zodResolver(zFormFieldsAccountChangeEmail()),
    values: {
      email: session.data?.user.email ?? '',
    },
  });

  return (
    <ResponsiveDrawer
      open={search.state === 'change-email-init'}
      onOpenChange={(open) =>
        router.navigate({
          replace: true,
          to: '.',
          search: {
            state: open ? 'change-email-init' : '',
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
          onSubmit={async ({ email }) => {
            changeEmailInit.mutate({
              email,
            });
          }}
          className="flex flex-col sm:gap-4"
        >
          <ResponsiveDrawerHeader>
            <ResponsiveDrawerTitle>Update your email</ResponsiveDrawerTitle>
            <ResponsiveDrawerDescription className="sr-only">
              Form to update your email
            </ResponsiveDrawerDescription>
          </ResponsiveDrawerHeader>
          <ResponsiveDrawerBody>
            <FormField>
              <FormFieldLabel className="sr-only">Email</FormFieldLabel>
              <FormFieldController
                control={form.control}
                type="email"
                name="email"
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
