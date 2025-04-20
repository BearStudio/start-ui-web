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
  FormFieldsAccountUpdateName,
  zFormFieldsAccountUpdateName,
} from '@/features/account/schema';

export const ChangeNameDrawer = (props: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const session = authClient.useSession();
  const form = useForm<FormFieldsAccountUpdateName>({
    resolver: zodResolver(zFormFieldsAccountUpdateName()),
    values: {
      name: session.data?.user.name ?? '',
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
          onSubmit={async ({ name }) => {
            // TODO Errors
            await authClient.updateUser({
              name,
            });
            form.reset();
            setOpen(false);
          }}
          className="flex flex-col md:gap-4"
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
