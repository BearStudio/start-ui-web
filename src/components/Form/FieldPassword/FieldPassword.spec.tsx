import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import { FormMocked } from '@/components/Form/form-test-utils';
import { render, screen, setupUser } from '@/tests/utils';

import { FormField, FormFieldController, FormFieldLabel } from '..';

test('update value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ password: z.string() })}
      useFormOptions={{ defaultValues: { password: '' } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Password</FormFieldLabel>
          <FormFieldController
            type="password"
            control={form.control}
            name="password"
          />
        </FormField>
      )}
    </FormMocked>
  );
  const input = screen.getByLabelText<HTMLInputElement>('Password');
  await user.type(input, 'new value');
  expect(screen.queryByText('new value')).toBeNull();
  expect(input.value).toBe('new value');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ password: 'new value' });
});

test('toggle visibility', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ password: z.string() })}
      useFormOptions={{ defaultValues: { password: '' } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Password</FormFieldLabel>
          <FormFieldController
            type="password"
            control={form.control}
            name="password"
          />
        </FormField>
      )}
    </FormMocked>
  );
  const input = screen.getByLabelText<HTMLInputElement>('Password');
  await user.type(input, 'new value');
  expect(screen.queryByText('new value')).toBeNull();
  await user.click(screen.getByRole('button', { name: /show password/i }));
  expect(screen.queryByText('new value')).toBeDefined();
  expect(input.value).toBe('new value');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ password: 'new value' });
});
