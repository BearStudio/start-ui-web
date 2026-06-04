import { FAILED_CLICK_TIMEOUT_MS, page, render, setupUser } from '@tests/utils';
import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import { FormField } from '@/platform/components/form';
import { FormMocked } from '@/platform/components/form/form-test-utils';

const zFormSchema = () =>
  z.object({
    lovesBears: z.boolean().refine((val) => val === true, {
      error: 'Please say you love bears.',
    }),
  });

test('should select checkbox on button click', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={zFormSchema()}
      defaultValues={{ lovesBears: false }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <form.AppField name="lovesBears">
            {(field) => <field.FieldCheckbox>I love bears</field.FieldCheckbox>}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );

  const checkbox = page.getByRole('checkbox', { name: 'I love bears' });

  await expect.element(checkbox).not.toBeChecked();

  await user.click(checkbox);
  await expect.element(checkbox).toBeChecked();

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ lovesBears: true });
});

test('should select checkbox on label click', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={zFormSchema()}
      defaultValues={{ lovesBears: false }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <form.AppField name="lovesBears">
            {(field) => <field.FieldCheckbox>I love bears</field.FieldCheckbox>}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );

  const checkbox = page.getByRole('checkbox', { name: 'I love bears' });
  const label = page.getByText('I love bears');

  await expect.element(checkbox).not.toBeChecked();

  // Test clicking the label specifically
  await user.click(label);
  await expect.element(checkbox).toBeChecked();

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ lovesBears: true });
});

test('default value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();
  render(
    <FormMocked
      schema={zFormSchema()}
      defaultValues={{ lovesBears: true }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <form.AppField name="lovesBears">
            {(field) => <field.FieldCheckbox>I love bears</field.FieldCheckbox>}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );

  const checkbox = page.getByRole('checkbox', { name: 'I love bears' });
  await expect.element(checkbox).toBeChecked();

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ lovesBears: true });
});

test('disabled', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();
  render(
    <FormMocked
      schema={z.object({ lovesBears: z.boolean() })}
      defaultValues={{ lovesBears: false }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <form.AppField name="lovesBears">
            {(field) => (
              <field.FieldCheckbox disabled>I love bears</field.FieldCheckbox>
            )}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );

  const checkbox = page.getByRole('checkbox', { name: 'I love bears' });
  await expect.element(checkbox).toBeDisabled();
  await expect.element(checkbox).not.toBeChecked();

  await user
    .click(checkbox, {
      trial: true,
      timeout: FAILED_CLICK_TIMEOUT_MS,
    })
    .catch(() => undefined);
  await expect.element(checkbox).not.toBeChecked();
  await user.click(page.getByRole('button', { name: 'Submit' }));
  // TanStack Form preserves disabled-field values; default false stays.
  expect(mockedSubmit).toHaveBeenCalledWith({ lovesBears: false });
});
