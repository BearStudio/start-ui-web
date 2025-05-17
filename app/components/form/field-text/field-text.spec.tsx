import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import { render, screen, setupUser } from '@/tests/utils';

import { FormMocked } from '../form-test-utils';

test('update value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ name: z.string() })}
      useFormOptions={{ defaultValues: { name: '' } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <form.AppField name="name">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Name</field.FormFieldLabel>
              <field.FieldText />
            </field.FormField>
          )}
        </form.AppField>
      )}
    </FormMocked>
  );
  const input = screen.getByLabelText<HTMLInputElement>('Name');
  await user.type(input, 'new value');
  expect(input.value).toBe('new value');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ name: 'new value' });
});

test('default value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();
  render(
    <FormMocked
      schema={z.object({ name: z.string() })}
      useFormOptions={{
        defaultValues: {
          name: 'default value',
        },
      }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <form.AppField name="name">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Name</field.FormFieldLabel>
              <field.FieldText />
            </field.FormField>
          )}
        </form.AppField>
      )}
    </FormMocked>
  );
  const input = screen.getByLabelText<HTMLInputElement>('Name');
  expect(input.value).toBe('default value');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ name: 'default value' });
});

test('disabled', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ name: z.string() })}
      useFormOptions={{ defaultValues: { name: 'new value' } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <form.AppField name="name">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Name</field.FormFieldLabel>
              <field.FieldText disabled />
            </field.FormField>
          )}
        </form.AppField>
      )}
    </FormMocked>
  );
  const input = screen.getByLabelText<HTMLInputElement>('Name');
  await user.type(input, 'another value');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ name: undefined });
});

test('readOnly', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ name: z.string() })}
      useFormOptions={{ defaultValues: { name: 'new value' } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <form.AppField name="name">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Name</field.FormFieldLabel>
              <field.FieldText readOnly />
            </field.FormField>
          )}
        </form.AppField>
      )}
    </FormMocked>
  );
  const input = screen.getByLabelText<HTMLInputElement>('Name');
  await user.type(input, 'another value');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ name: 'new value' });
});
