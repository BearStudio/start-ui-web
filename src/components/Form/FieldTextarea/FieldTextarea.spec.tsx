import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import { FormMocked } from '@/components/Form/form-test-utils';
import { render, screen, setupUser } from '@/tests/utils';

import { FormField } from '..';

test('update value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ description: z.string() })}
      useFormOptions={{ defaultValues: { description: '' } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField
          type="textarea"
          control={form.control}
          name="description"
          label="Description"
        />
      )}
    </FormMocked>
  );
  const input = screen.getByLabelText<HTMLInputElement>('Description');
  await user.type(input, 'new value');
  expect(input.value).toBe('new value');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ description: 'new value' });
});

test('default value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();
  render(
    <FormMocked
      schema={z.object({ description: z.string() })}
      useFormOptions={{
        defaultValues: {
          description: 'default value',
        },
      }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField
          type="textarea"
          control={form.control}
          name="description"
          label="Description"
        />
      )}
    </FormMocked>
  );
  const input = screen.getByLabelText<HTMLInputElement>('Description');
  expect(input.value).toBe('default value');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ description: 'default value' });
});
