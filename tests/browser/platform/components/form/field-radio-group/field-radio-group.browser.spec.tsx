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

test('should select radio on button click', async () => {
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
            {(field) => <field.FieldRadioGroup options={options} />}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );

  const radio = page.getByRole('radio', { name: 'Buzz Pawdrin' });
  await expect.element(radio).not.toBeChecked();

  await user.click(radio);
  await expect.element(radio).toBeChecked();

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bear: 'pawdrin' });
});

test('should select radio on label click', async () => {
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
            {(field) => <field.FieldRadioGroup options={options} />}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );

  const radio = page.getByRole('radio', { name: 'Buzz Pawdrin' });
  const label = page.getByText('Buzz Pawdrin');

  await expect.element(radio).not.toBeChecked();

  await user.click(label);
  await expect.element(radio).toBeChecked();

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bear: 'pawdrin' });
});

test('should handle keyboard navigation', async () => {
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
            {(field) => <field.FieldRadioGroup options={options} />}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );

  const firstRadio = page.getByRole('radio', { name: 'Bearstrong' });
  const secondRadio = page.getByRole('radio', { name: 'Buzz Pawdrin' });
  const thirdRadio = page.getByRole('radio', { name: 'Yuri Grizzlyrin' });

  await user.tab();
  await expect.element(firstRadio).toHaveFocus();

  await user.keyboard('{ArrowDown}');
  await expect.element(secondRadio).toHaveFocus();
  await user.keyboard(' ');
  await expect.element(secondRadio).toBeChecked();

  await user.keyboard('{ArrowDown}');
  await expect.element(thirdRadio).toHaveFocus();

  await user.keyboard('{ArrowUp}');
  await expect.element(secondRadio).toHaveFocus();
  await expect.element(secondRadio).toBeChecked();

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
            {(field) => <field.FieldRadioGroup options={options} />}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );

  const radio = page.getByRole('radio', { name: 'Yuri Grizzlyrin' });
  await expect.element(radio).toBeChecked();

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
            {(field) => <field.FieldRadioGroup disabled options={options} />}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );

  const radio = page.getByRole('radio', { name: 'Buzz Pawdrin' });
  await expect.element(radio).toBeDisabled();

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
            {(field) => <field.FieldRadioGroup options={options} />}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );

  const disabledRadio = page.getByRole('radio', { name: 'Mae Jemibear' });
  await expect.element(disabledRadio).toBeDisabled();

  try {
    await user.click(disabledRadio, { timeout: FAILED_CLICK_TIMEOUT_MS });
  } catch {
    // Expected to fail since input is disabled
  }
  await expect.element(disabledRadio).not.toBeChecked();

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bear: '' });
});
