import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import { FormMocked } from '@/components/Form/form-test-utils';
import { render, screen, setupUser } from '@/tests/utils';

import { FormField } from '..';

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
        <FormField
          type="multi-select"
          control={form.control}
          name="colors"
          label="Colors"
          options={options}
        />
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
        <FormField
          type="multi-select"
          control={form.control}
          name="colors"
          label="Colors"
          options={options}
        />
      )}
    </FormMocked>
  );
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ colors: ['green', 'blue'] });
});
