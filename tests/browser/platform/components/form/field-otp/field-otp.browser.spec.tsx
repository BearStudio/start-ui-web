import { FAILED_CLICK_TIMEOUT_MS, page, render, setupUser } from '@tests/utils';
import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import { FormField, FormFieldLabel } from '@/platform/components/form';
import { FormMocked } from '@/platform/components/form/form-test-utils';

test('update value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ code: z.string().min(6).max(6) })}
      defaultValues={{ code: '' }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Code</FormFieldLabel>
          <form.AppField name="code">
            {(field) => <field.FieldOtp type="otp" maxLength={6} />}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );

  const input = page.getByLabelText('Code');
  await user.click(input);
  // Add the code to the user clipboard
  await navigator.clipboard.writeText('000000');

  await user.paste();
  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ code: '000000' });
});

test('default value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();
  render(
    <FormMocked
      schema={z.object({ code: z.string() })}
      defaultValues={{
        code: '000000',
      }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Code</FormFieldLabel>
          <form.AppField name="code">
            {(field) => <field.FieldOtp type="otp" maxLength={6} />}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );
  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ code: '000000' });
});

test('auto submit', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ code: z.string().min(6).max(6) })}
      defaultValues={{ code: '' }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Code</FormFieldLabel>
          <form.AppField name="code">
            {(field) => <field.FieldOtp type="otp" maxLength={6} autoSubmit />}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );
  const input = page.getByLabelText('Code');
  await user.click(input);
  // Add the code to the user clipboard
  await navigator.clipboard.writeText('000000');
  await user.paste();
  expect(mockedSubmit).toHaveBeenCalledWith({ code: '000000' });
});

test('auto submit after filling the full code without clicking submit', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ code: z.string().min(6).max(6) })}
      defaultValues={{ code: '' }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Code</FormFieldLabel>
          <form.AppField name="code">
            {(field) => <field.FieldOtp type="otp" maxLength={6} autoSubmit />}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );

  const input = page.getByLabelText('Code');
  await user.click(input);
  await user.keyboard('000000');

  expect(mockedSubmit).toHaveBeenCalledWith({ code: '000000' });
});

test('disabled', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ code: z.string().min(6).max(6) })}
      defaultValues={{ code: '000000' }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Code</FormFieldLabel>
          <form.AppField name="code">
            {(field) => <field.FieldOtp type="otp" maxLength={6} disabled />}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );
  const input = page.getByLabelText('Code');
  try {
    await user.click(input, { timeout: FAILED_CLICK_TIMEOUT_MS });
  } catch {
    // Click expected to fail since input is disabled
  }
  // Add the code to the user clipboard
  await navigator.clipboard.writeText('123456');
  await user.paste();

  await user.click(page.getByRole('button', { name: 'Submit' }));

  // TanStack Form preserves disabled-field values; the default OTP submits.
  expect(mockedSubmit).toHaveBeenCalledWith({ code: '000000' });
});
