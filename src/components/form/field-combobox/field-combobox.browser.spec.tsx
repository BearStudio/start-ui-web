import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import {
  FAILED_CLICK_TIMEOUT_MS,
  page,
  render,
  setupUser,
} from '@/tests/utils';

import { FormField, FormFieldController, FormFieldLabel } from '..';
import { FormMocked } from '../form-test-utils';

const options = [
  { value: 'bearstrong', label: 'Bearstrong' },
  { value: 'pawdrin', label: 'Buzz Pawdrin' },
  { value: 'grizzlyrin', label: 'Yuri Grizzlyrin' },
  { value: 'jemibear', label: 'Mae Jemibear', disabled: true },
];

test('should select item on click', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  await render(
    <FormMocked
      schema={z.object({ bear: z.string() })}
      useFormOptions={{ defaultValues: { bear: '' } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            type="combobox"
            control={form.control}
            name="bear"
            items={options}
          />
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

  await render(
    <FormMocked
      schema={z.object({ bear: z.string() })}
      useFormOptions={{ defaultValues: { bear: 'grizzlyrin' } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            type="combobox"
            control={form.control}
            name="bear"
            items={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const input = page.getByRole('combobox', {
    name: 'Bearstronaut',
  }) as unknown as { element(): HTMLInputElement };
  expect(input.element().value).toBe('Yuri Grizzlyrin');

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bear: 'grizzlyrin' });
});

test('disabled', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  await render(
    <FormMocked
      schema={z.object({ bear: z.string() })}
      useFormOptions={{ defaultValues: { bear: 'pawdrin' } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            type="combobox"
            control={form.control}
            name="bear"
            disabled
            items={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const input = page.getByRole('combobox', { name: 'Bearstronaut' });
  await expect.element(input).toBeDisabled();

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bear: undefined });
});

test('disabled option', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  await render(
    <FormMocked
      schema={z.object({ bear: z.string() })}
      useFormOptions={{ defaultValues: { bear: '' } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            type="combobox"
            control={form.control}
            name="bear"
            items={options}
          />
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

test('clears to null, submits natively under its name and follows a reset', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  await render(
    <FormMocked
      schema={z.object({ bear: z.string().nullable() })}
      useFormOptions={{ defaultValues: { bear: 'pawdrin' } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <>
          <FormField>
            <FormFieldLabel>Bearstronaut</FormFieldLabel>
            <FormFieldController
              type="combobox"
              control={form.control}
              name="bear"
              items={options}
              showClear
            />
          </FormField>
          <button type="button" onClick={() => form.reset()}>
            Reset
          </button>
        </>
      )}
    </FormMocked>
  );

  const input = page.getByRole('combobox', { name: 'Bearstronaut' });
  await expect.element(input).toHaveValue('Buzz Pawdrin');
  const formElement = input.element().closest('form');
  expect(formElement && [...new FormData(formElement)]).toEqual([
    ['bear', 'pawdrin'],
  ]);

  await user.click(page.getByRole('button', { name: 'Clear' }));
  await expect.element(input).toHaveValue('');
  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenLastCalledWith({ bear: null });

  await user.click(page.getByRole('button', { name: 'Reset' }));
  await expect.element(input).toHaveValue('Buzz Pawdrin');
});

test('filters as you type and picks the highlighted item with Enter', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  await render(
    <FormMocked
      schema={z.object({ bear: z.string({ error: 'Required' }) })}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            type="combobox"
            control={form.control}
            name="bear"
            items={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const input = page.getByRole('combobox', { name: 'Bearstronaut' });
  await user.click(page.getByRole('button', { name: 'Submit' }));
  await expect.element(input).toHaveAttribute('aria-invalid', 'true');

  await user.type(input, 'yuri');
  await expect
    .element(page.getByRole('option', { name: 'Buzz Pawdrin' }))
    .not.toBeInTheDocument();
  await expect
    .element(page.getByRole('option', { name: 'Yuri Grizzlyrin' }))
    .toHaveAttribute('data-highlighted');
  await user.keyboard('{Enter}');
  await expect.element(input).toHaveValue('Yuri Grizzlyrin');

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bear: 'grizzlyrin' });
});
