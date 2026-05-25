import { expect, test } from 'vitest';

import { page, render, setupUser } from '@/tests/utils';

import { Form } from './form';
import { FormField } from './form-field';
import { FormFieldLabel } from './form-field-label';
import { useAppForm, useTypedAppFormContext } from './use-app-form';

const FormContextSetter = () => {
  const form = useTypedAppFormContext({
    defaultValues: { email: '' },
  });

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

test('provides the typed form context to child components', async () => {
  const user = setupUser();

  render(<FormWithContextConsumer />);

  await user.click(page.getByRole('button', { name: 'Use admin email' }));

  await expect.element(page.getByLabelText('Email')).toBeInTheDocument();
  expect(
    (page.getByLabelText('Email').element() as HTMLInputElement).value
  ).toBe('admin@admin.com');
});
