import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import { page, render, setupUser } from '@/tests/utils';

import { FormField, FormFieldLabel } from '..';
import { FormFieldController } from '../form-field-controller';
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
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <FormFieldController
            type="textarea"
            control={form.control}
            name="name"
          />
        </FormField>
      )}
    </FormMocked>
  );
  const input = page.getByLabelText('Name').element() as HTMLInputElement;

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
      useFormOptions={{
        defaultValues: {
          name: 'default value',
        },
      }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <FormFieldController
            type="textarea"
            control={form.control}
            name="name"
          />
        </FormField>
      )}
    </FormMocked>
  );
  const input = page.getByLabelText('Name').element() as HTMLInputElement;
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
      useFormOptions={{ defaultValues: { name: 'new value' } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <FormFieldController
            type="textarea"
            control={form.control}
            name="name"
            disabled
          />
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
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <FormFieldController
            type="textarea"
            control={form.control}
            name="name"
            readOnly
          />
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
