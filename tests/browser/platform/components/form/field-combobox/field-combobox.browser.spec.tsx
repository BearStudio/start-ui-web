import { FAILED_CLICK_TIMEOUT_MS, page, render, setupUser } from '@tests/utils';
import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import { FormField, FormFieldLabel } from '@/platform/components/form';
import { FormMocked } from '@/platform/components/form/form-test-utils';

const options = [
  { value: 'bearstrong', label: 'Bearstrong' },
  { value: 'pawdrin', label: 'Buzz Pawdrin' },
  { value: 'grizzlyrin', label: 'Yuri Grizzlyrin' },
  { value: 'jemibear', label: 'Mae Jemibear', disabled: true },
];

test('should select item on click', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ bear: z.string() })}
      defaultValues={{ bear: '' }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <form.AppField name="bear">
            {(field) => <field.FieldCombobox items={options} />}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );

  const input = page.getByRole('combobox', { name: 'Bearstronaut' });
  await user.click(input);

  const option = page.getByRole('option', { name: 'Buzz Pawdrin' });
  await user.click(option);

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bear: 'pawdrin' });
});

test('default value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ bear: z.string() })}
      defaultValues={{ bear: 'grizzlyrin' }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <form.AppField name="bear">
            {(field) => <field.FieldCombobox items={options} />}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );

  const input = page.getByRole('combobox', {
    name: 'Bearstronaut',
  });
  await expect.element(input).toBeDefined();
  expect((input.element() as HTMLInputElement).value).toBe('Yuri Grizzlyrin');

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bear: 'grizzlyrin' });
});

test('disabled', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ bear: z.string() })}
      defaultValues={{ bear: 'pawdrin' }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <form.AppField name="bear">
            {(field) => <field.FieldCombobox disabled items={options} />}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );

  const input = page.getByRole('combobox', { name: 'Bearstronaut' });
  await expect.element(input).toBeDisabled();

  await user.click(page.getByRole('button', { name: 'Submit' }));
  // TanStack Form preserves disabled-field values.
  expect(mockedSubmit).toHaveBeenCalledWith({ bear: 'pawdrin' });
});

test('disabled option', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ bear: z.string() })}
      defaultValues={{ bear: '' }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <form.AppField name="bear">
            {(field) => <field.FieldCombobox items={options} />}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );

  const input = page.getByRole('combobox', { name: 'Bearstronaut' });
  await user.click(input);

  const disabledOption = page.getByRole('option', { name: 'Mae Jemibear' });
  await expect.element(disabledOption).toHaveAttribute('aria-disabled', 'true');

  try {
    await user.click(disabledOption, { timeout: FAILED_CLICK_TIMEOUT_MS });
  } catch {
    // Expected to fail since option is disabled
  }

  await user.keyboard('{Escape}');

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bear: '' });
});
