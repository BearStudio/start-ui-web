import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import {
  FAILED_CLICK_TIMEOUT_MS,
  page,
  render,
  setupUser,
} from '@/tests/utils';

import { FormField, FormFieldController } from '..';
import { FormMocked } from '../form-test-utils';

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
      useFormOptions={{ defaultValues: { lovesBears: false } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldController
            type="checkbox"
            control={form.control}
            name="lovesBears"
          >
            I love bears
          </FormFieldController>
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
      useFormOptions={{ defaultValues: { lovesBears: false } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldController
            type="checkbox"
            control={form.control}
            name="lovesBears"
          >
            I love bears
          </FormFieldController>
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
      useFormOptions={{ defaultValues: { lovesBears: true } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldController
            type="checkbox"
            control={form.control}
            name="lovesBears"
          >
            I love bears
          </FormFieldController>
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
      useFormOptions={{ defaultValues: { lovesBears: false } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldController
            type="checkbox"
            control={form.control}
            name="lovesBears"
            disabled
          >
            I love bears
          </FormFieldController>
        </FormField>
      )}
    </FormMocked>
  );

  const checkbox = page.getByRole('checkbox', { name: 'I love bears' });
  await expect.element(checkbox).toBeDisabled();
  await expect.element(checkbox).not.toBeChecked();

  try {
    await user.click(checkbox, {
      trial: true,
      timeout: FAILED_CLICK_TIMEOUT_MS,
    });
  } catch {
    await expect.element(checkbox).not.toBeChecked();
  }
  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ lovesBears: undefined });
});
