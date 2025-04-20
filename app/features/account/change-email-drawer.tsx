import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
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

export const ChangeEmailDrawer = (props: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const session = authClient.useSession();

  const changeEmail = useMutation(
    orpc.account.changeEmailInit.mutationOptions({
      onSuccess: () => {
        // TODO handle next screen
        form.reset();
        setOpen(false);
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
    <ResponsiveDrawer open={open} onOpenChange={setOpen}>
      <ResponsiveDrawerTrigger asChild>
        {props.children}
      </ResponsiveDrawerTrigger>

      <ResponsiveDrawerContent>
        <Form
          {...form}
          onSubmit={async ({ email }) => {
            changeEmail.mutate({
              email,
            });
          }}
          className="flex flex-col md:gap-4"
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
