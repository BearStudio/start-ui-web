import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import { FormMocked } from '@/components/Form/form-test-utils';
import { render, screen, setupUser } from '@/tests/utils';

import { FormField, FormFieldController, FormFieldLabel } from '..';

const options = [
  { label: 'Red', value: 'red' },
  { label: 'Green', value: 'green' },
  { label: 'Blue', value: 'blue' },
] as const;

test('update value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ color: z.enum(['red', 'green', 'blue']) })}
      useFormOptions={{ defaultValues: { color: undefined } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Color</FormFieldLabel>
          <FormFieldController
            type="radios"
            control={form.control}
            name="color"
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );
  await user.click(screen.getByLabelText('Green'));
  await user.click(screen.getByLabelText('Blue'));

  expect(screen.getByLabelText<HTMLInputElement>('Green').checked).toBe(false);
  expect(screen.getByLabelText<HTMLInputElement>('Blue').checked).toBe(true);
  expect(screen.getByLabelText<HTMLInputElement>('Red').checked).toBe(false);

  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ color: 'blue' });
});

test('default value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();
  render(
    <FormMocked
      schema={z.object({ color: z.enum(['red', 'green', 'blue']) })}
      useFormOptions={{
        defaultValues: {
          color: 'green',
        },
      }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Color</FormFieldLabel>
          <FormFieldController
            type="radios"
            control={form.control}
            name="color"
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  expect(screen.getByLabelText<HTMLInputElement>('Green').checked).toBe(true);
  expect(screen.getByLabelText<HTMLInputElement>('Blue').checked).toBe(false);
  expect(screen.getByLabelText<HTMLInputElement>('Red').checked).toBe(false);

  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ color: 'green' });
});

test('disabled', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();
  render(
    <FormMocked
      schema={z.object({ color: z.enum(['red', 'green', 'blue']) })}
      useFormOptions={{
        defaultValues: {
          color: 'green',
        },
      }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Color</FormFieldLabel>
          <FormFieldController
            type="radios"
            control={form.control}
            name="color"
            isDisabled
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  await user.click(screen.getByLabelText('Blue'));

  expect(screen.getByLabelText<HTMLInputElement>('Green').checked).toBe(true);
  expect(screen.getByLabelText<HTMLInputElement>('Blue').checked).toBe(false);
  expect(screen.getByLabelText<HTMLInputElement>('Red').checked).toBe(false);

  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ color: 'green' });
});
