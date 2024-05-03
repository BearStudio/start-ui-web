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
      schema={z.object({ color: z.enum(['red', 'green', 'blue']) })}
      useFormOptions={{ defaultValues: { color: undefined } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField
          type="radios"
          control={form.control}
          name="color"
          label="Color"
          options={options}
        />
      )}
    </FormMocked>
  );
  await user.click(screen.getByLabelText('Green'));
  await user.click(screen.getByLabelText('Blue'));

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
        <FormField
          type="radios"
          control={form.control}
          name="color"
          label="Color"
          options={options}
        />
      )}
    </FormMocked>
  );
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ color: 'green' });
});
