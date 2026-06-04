import { page, render, setupUser } from '@tests/utils';
import { expect, test } from 'vitest';

import { Form } from '@/platform/components/form/form';
import { FormField } from '@/platform/components/form/form-field';
import { FormFieldLabel } from '@/platform/components/form/form-field-label';
import {
  useAppForm,
  useTypedAppFormContext,
} from '@/platform/components/form/use-app-form';

const FormContextSetter = () => {
  const form = useTypedAppFormContext({});

  return (
    <button
      type="button"
      onClick={() => form.setFieldValue('email', 'admin@admin.com')}
    >
      Use admin email
    </button>
  );
};

const FormWithContextConsumer = () => {
  const form = useAppForm({
    defaultValues: { email: '' },
  });

  return (
    <Form form={form}>
      <FormField>
        <FormFieldLabel>Email</FormFieldLabel>
        <form.AppField name="email">
          {(field) => <field.FieldText type="email" />}
        </form.AppField>
      </FormField>
      <FormContextSetter />
    </Form>
  );
};

const FormWithSafeAction = () => {
  const form = useAppForm({
    defaultValues: { email: '' },
  });

  return (
    <Form form={form} data-testid="form">
      <button type="submit">Submit</button>
    </Form>
  );
};

test('provides the typed form context to child components', async () => {
  const user = setupUser();

  render(<FormWithContextConsumer />);

  await user.click(page.getByRole('button', { name: 'Use admin email' }));

  await expect.element(page.getByLabelText('Email')).toBeInTheDocument();
  expect(
    (page.getByLabelText('Email').element() as HTMLInputElement).value
  ).toBe('admin@admin.com');
});

test('uses a CSP-safe fallback action', async () => {
  render(<FormWithSafeAction />);

  await expect.element(page.getByTestId('form')).toHaveAttribute('action', '#');
});

test('removes inert after hydration', async () => {
  render(<FormWithSafeAction />);

  await expect.element(page.getByTestId('form')).not.toHaveAttribute('inert');
});
