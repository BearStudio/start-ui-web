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
      schema={z.object({ code: z.string().min(6).max(6) })}
      useFormOptions={{ defaultValues: { code: '' } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField type="otp" control={form.control} name="code" label="Code" />
      )}
    </FormMocked>
  );
  const input = screen.getByLabelText<HTMLInputElement>('Code');
  await user.click(input);
  await user.paste('000000');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ code: '000000' });
});

test('default value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();
  render(
    <FormMocked
      schema={z.object({ code: z.string() })}
      useFormOptions={{
        defaultValues: {
          code: '000000',
        },
      }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField type="otp" control={form.control} name="code" label="Code" />
      )}
    </FormMocked>
  );
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ code: '000000' });
});

test('auto submit', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ code: z.string().min(6).max(6) })}
      useFormOptions={{ defaultValues: { code: '' } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField
          type="otp"
          control={form.control}
          name="code"
          label="Code"
          autoSubmit
        />
      )}
    </FormMocked>
  );
  const input = screen.getByLabelText<HTMLInputElement>('Code');
  await user.click(input);
  await user.paste('000000');
  expect(mockedSubmit).toHaveBeenCalledWith({ code: '000000' });
});
