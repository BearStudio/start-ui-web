import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearch } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
  FormFieldsAccountChangeEmailInit,
  zFormFieldsAccountChangeEmailInit,
} from '@/features/account/schema';

export const ChangeEmailInitDrawer = (props: { children: ReactNode }) => {
  const router = useRouter();
  const search = useSearch({ strict: false });
  const session = authClient.useSession();

  const changeEmailInit = useMutation(
    orpc.account.changeEmailInit.mutationOptions({
      onSuccess: (_, { email }) => {
        router.navigate({
          replace: true,
          to: '.',
          search: {
            state: 'change-email-verify',
            newEmail: email,
          },
        });
        form.reset();
      },
      onError: () => toast.error('Failed to send verification email'),
    })
  );

  const form = useForm<FormFieldsAccountChangeEmailInit>({
    resolver: zodResolver(zFormFieldsAccountChangeEmailInit()),
    values: {
      email: session.data?.user.email ?? '',
    },
  });

  return (
    <ResponsiveDrawer
      open={search.state === 'change-email-init'}
      onOpenChange={(open) => {
        form.reset();
        router.navigate({
          replace: true,
          to: '.',
          search: {
            state: open ? 'change-email-init' : '',
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
          onSubmit={async ({ email }) => {
            if (email === session.data?.user.email) {
              form.setError('email', { message: 'This is your current email' });
              return;
            }
            changeEmailInit.mutate({
              email,
            });
          }}
          className="flex flex-col sm:gap-4"
        >
          <ResponsiveDrawerHeader>
            <ResponsiveDrawerTitle>Update your email</ResponsiveDrawerTitle>
            <ResponsiveDrawerDescription>
              An email will be sent to validate your new email.
            </ResponsiveDrawerDescription>
          </ResponsiveDrawerHeader>
          <ResponsiveDrawerBody>
            <FormField>
              <FormFieldLabel>Your new email</FormFieldLabel>
              <FormFieldController
                control={form.control}
                type="email"
                name="email"
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
              loading={changeEmailInit.isPending}
            >
              Send Verification Code
            </Button>
          </ResponsiveDrawerFooter>
        </Form>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
};
