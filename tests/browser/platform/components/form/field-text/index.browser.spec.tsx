import { page, render, setupUser } from '@tests/utils';
import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import { FormField, FormFieldLabel } from '@/platform/components/form';
import { FormMocked } from '@/platform/components/form/form-test-utils';

test('update value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ name: z.string() })}
      defaultValues={{ name: '' }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <form.AppField name="name">
            {(field) => <field.FieldText type="text" />}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );
  const nameInput = page.getByLabelText('Name');
  await expect.element(nameInput).toBeDefined();
  const input = nameInput.element() as HTMLInputElement;

  await user.type(input, 'new value');
  expect(input.value).toBe('new value');
  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ name: 'new value' });
});

test('default value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();
  render(
    <FormMocked
      schema={z.object({ name: z.string() })}
      defaultValues={{
        name: 'default value',
      }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <form.AppField name="name">
            {(field) => <field.FieldText type="text" />}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );
  const nameInput = page.getByLabelText('Name');
  await expect.element(nameInput).toBeDefined();
  const input = nameInput.element() as HTMLInputElement;
  expect(input.value).toBe('default value');
  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ name: 'default value' });
});

test('disabled', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ name: z.string() })}
      defaultValues={{ name: 'new value' }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <form.AppField name="name">
            {(field) => <field.FieldText type="text" disabled />}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );
  const input = page.getByLabelText('Name');
  try {
    await user.type(input, 'another value');
  } catch {
    // Expected to fail since input is disabled
  }
  await user.click(page.getByRole('button', { name: 'Submit' }));
  // TanStack Form keeps the value of disabled fields in form state, unlike
  // RHF which unregisters them. The submitted payload retains the default.
  expect(mockedSubmit).toHaveBeenCalledWith({ name: 'new value' });
});

test('readOnly', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ name: z.string() })}
      defaultValues={{ name: 'new value' }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <form.AppField name="name">
            {(field) => <field.FieldText type="text" readOnly />}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );
  const input = page.getByLabelText('Name');
  try {
    await user.type(input, 'another value');
  } catch {
    // Expected to fail since input is readOnly
  }
  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ name: 'new value' });
});
