import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { Card, CardContent } from '@/components/ui/card';

import {
  FormFieldsAccountUpdateEmail,
  zFormFieldsAccountUpdateEmail,
} from '@/features/account/schemas';
import { authClient } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';

export const AccountUpdateEmail = () => {
  const form = useForm<FormFieldsAccountUpdateEmail>({
    resolver: zodResolver(zFormFieldsAccountUpdateEmail()),
    defaultValues: {
      email: '',
    },
  });
  return (
    <Card>
      <CardContent>
        <Form
          {...form}
          onSubmit={async ({ email }) => {
            await authClient.changeEmail({
              newEmail: email,
              callbackURL: window.location.href,
            });
            form.reset();
          }}
        >
          <FormField>
            <FormFieldLabel>New Email</FormFieldLabel>
            <FormFieldController
              control={form.control}
              type="email"
              name="email"
            />
          </FormField>
          <Button type="submit" loading={form.formState.isSubmitting}>
            Submit
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
};
