import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import { FormFieldController } from '@/components/Form/FormFieldController';
import { FormMocked } from '@/components/Form/form-test-utils';
import { render, screen, setupUser } from '@/tests/utils';

import { FormField, FormFieldLabel } from '..';

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
          <FormFieldController type="text" control={form.control} name="name" />
        </FormField>
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
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <FormFieldController type="text" control={form.control} name="name" />
        </FormField>
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
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <FormFieldController
            type="text"
            control={form.control}
            name="name"
            isDisabled
          />
        </FormField>
      )}
    </FormMocked>
  );
  const input = screen.getByLabelText<HTMLInputElement>('Name');
  await user.type(input, 'another value');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ name: 'new value' });
});
