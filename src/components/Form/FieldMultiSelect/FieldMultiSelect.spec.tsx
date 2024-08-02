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
      schema={z.object({ colors: z.string().array() })}
      useFormOptions={{ defaultValues: { colors: undefined } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Colors</FormFieldLabel>
          <FormFieldController
            type="multi-select"
            control={form.control}
            name="colors"
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );
  const input = screen.getByLabelText<HTMLInputElement>('Colors');
  await user.type(input, 'green');
  await user.tab();
  await user.type(input, 'blue');
  await user.tab();
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ colors: ['green', 'blue'] });
});

test('default value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();
  render(
    <FormMocked
      schema={z.object({ colors: z.string().array() })}
      useFormOptions={{
        defaultValues: {
          colors: ['green', 'blue'],
        },
      }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Colors</FormFieldLabel>
          <FormFieldController
            type="multi-select"
            control={form.control}
            name="colors"
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  // Checking that the default value is selected
  expect(screen.getByText('Blue')).toBeDefined();

  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ colors: ['green', 'blue'] });
});

test('disabled', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();
  render(
    <FormMocked
      schema={z.object({ colors: z.string().array() })}
      useFormOptions={{
        defaultValues: {
          colors: ['green', 'blue'],
        },
      }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Colors</FormFieldLabel>
          <FormFieldController
            type="multi-select"
            control={form.control}
            name="colors"
            isDisabled
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const input = screen.getByLabelText<HTMLInputElement>('Colors');
  await user.type(input, 'red');
  await user.tab();

  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ colors: ['green', 'blue'] });
});
