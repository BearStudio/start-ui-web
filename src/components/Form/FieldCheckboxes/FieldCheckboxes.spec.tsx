import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import { render, screen, setupUser } from '@/tests/utils';

import { FormField } from '..';
import { FormMocked } from '../form-test-utils';

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
          type="checkboxes"
          control={form.control}
          name="colors"
          label="Colors"
          options={options}
        />
      )}
    </FormMocked>
  );
  await user.click(screen.getByLabelText<HTMLInputElement>('Green'));
  await user.click(screen.getByLabelText<HTMLInputElement>('Blue'));

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
          type="checkboxes"
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
