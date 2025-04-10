import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import { render, screen, setupUser } from '@/tests/utils';

import { FormField, FormFieldController, FormFieldLabel } from '..';
import { FormMocked } from '../form-test-utils';

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
        <FormField>
          <FormFieldLabel>Code</FormFieldLabel>
          <FormFieldController
            type="otp"
            control={form.control}
            name="code"
            maxLength={6}
          />
        </FormField>
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
        <FormField>
          <FormFieldLabel>Code</FormFieldLabel>
          <FormFieldController
            type="otp"
            control={form.control}
            name="code"
            maxLength={6}
          />
        </FormField>
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
        <FormField>
          <FormFieldLabel>Code</FormFieldLabel>
          <FormFieldController
            type="otp"
            control={form.control}
            name="code"
            maxLength={6}
            autoSubmit
          />
        </FormField>
      )}
    </FormMocked>
  );
  const input = screen.getByLabelText<HTMLInputElement>('Code');
  await user.click(input);
  await user.paste('000000');
  expect(mockedSubmit).toHaveBeenCalledWith({ code: '000000' });
});

test('disabled', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ code: z.string().min(6).max(6) })}
      useFormOptions={{ defaultValues: { code: '000000' } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Code</FormFieldLabel>
          <FormFieldController
            type="otp"
            control={form.control}
            name="code"
            maxLength={6}
            disabled
          />
        </FormField>
      )}
    </FormMocked>
  );
  const input = screen.getByLabelText<HTMLInputElement>('Code');
  await user.click(input);
  await user.paste('123456');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ code: undefined });
});
