import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode, useState } from 'react';
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
  FormFieldsAccountUpdateEmail,
  zFormFieldsAccountUpdateEmail,
} from '@/features/account/schemas';

export const UpdateEmailDrawer = (props: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const session = authClient.useSession();
  const form = useForm<FormFieldsAccountUpdateEmail>({
    resolver: zodResolver(zFormFieldsAccountUpdateEmail()),
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
            // TODO Errors
            await authClient.changeEmail({
              newEmail: email,
              callbackURL: window.location.href,
            });
            form.reset();
            setOpen(false);
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
