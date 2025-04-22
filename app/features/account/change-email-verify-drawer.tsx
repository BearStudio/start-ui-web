import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearch } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { authClient } from '@/lib/auth/client';
import { AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES } from '@/lib/auth/config';
import { orpc } from '@/lib/orpc/client';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldHelper,
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
} from '@/components/ui/responsive-drawer';

import {
  FormFieldsAccountChangeEmailVerify,
  zFormFieldsAccountChangeEmailVerify,
} from '@/features/account/schema';

export const ChangeEmailVerifyDrawer = () => {
  const session = authClient.useSession();
  const router = useRouter();
  const search = useSearch({ strict: false });

  const changeEmailVerify = useMutation(
    orpc.account.changeEmailVerify.mutationOptions({
      onSuccess: async () => {
        await session.refetch();
        toast.success('Email updated');
        router.navigate({
          replace: true,
          to: '.',
          search: {
            state: '',
          },
        });
        form.reset();
      },
      onError: () => {
        form.setError('otp', { message: 'Invalid code' });
      },
    })
  );

  const form = useForm<FormFieldsAccountChangeEmailVerify>({
    resolver: zodResolver(zFormFieldsAccountChangeEmailVerify()),
    defaultValues: {
      otp: '',
    },
  });

  return (
    <ResponsiveDrawer
      open={search.state === 'change-email-verify'}
      onOpenChange={(open) => {
        form.reset();
        router.navigate({
          replace: true,
          to: '.',
          search: {
            state: open ? 'change-email-verify' : '',
          },
        });
      }}
      autoFocus
    >
      <ResponsiveDrawerContent className="sm:max-w-xs">
        <Form
          {...form}
          onSubmit={async ({ otp }) => {
            changeEmailVerify.mutate({
              otp,
              email: search.newEmail ?? '',
            });
          }}
          className="flex flex-col sm:gap-4"
        >
          <ResponsiveDrawerHeader>
            <ResponsiveDrawerTitle>Verification</ResponsiveDrawerTitle>
            <ResponsiveDrawerDescription>
              We have sent a code to <strong>{search.newEmail}</strong>. Enter
              it below.
            </ResponsiveDrawerDescription>
          </ResponsiveDrawerHeader>
          <ResponsiveDrawerBody>
            <FormField>
              <FormFieldLabel>Verification code</FormFieldLabel>
              <FormFieldController
                control={form.control}
                type="otp"
                name="otp"
                size="lg"
                maxLength={6}
                autoSubmit
              />
              <FormFieldHelper>
                The code expires shortly ({AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES}{' '}
                minutes)
              </FormFieldHelper>
            </FormField>
          </ResponsiveDrawerBody>
          <ResponsiveDrawerFooter>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={changeEmailVerify.isPending}
            >
              Confirm
            </Button>
          </ResponsiveDrawerFooter>
        </Form>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
};
