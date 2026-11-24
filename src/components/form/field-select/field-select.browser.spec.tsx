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
            type="select"
            control={form.control}
            name="bear"
            items={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const trigger = page.getByRole('combobox', { name: 'Bearstronaut' });
  await user.click(trigger);

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
            type="select"
            control={form.control}
            name="bear"
            items={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  await expect
    .element(page.getByRole('combobox', { name: 'Bearstronaut' }))
    .toMatchTextContent('Yuri Grizzlyrin');

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
            type="select"
            control={form.control}
            name="bear"
            disabled
            items={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const trigger = page.getByRole('combobox', { name: 'Bearstronaut' });
  await expect.element(trigger).toBeDisabled();

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
            type="select"
            control={form.control}
            name="bear"
            items={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const trigger = page.getByRole('combobox', { name: 'Bearstronaut' });
  await user.click(trigger);

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

test('shows the error, submits natively under its name and follows a reset', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  await render(
    <FormMocked
      schema={z.object({ bear: z.string({ error: 'Required' }) })}
      useFormOptions={{ defaultValues: { bear: undefined } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <>
          <FormField>
            <FormFieldLabel>Bearstronaut</FormFieldLabel>
            <FormFieldController
              type="select"
              control={form.control}
              name="bear"
              items={options}
            />
          </FormField>
          <button type="button" onClick={() => form.reset()}>
            Reset
          </button>
        </>
      )}
    </FormMocked>
  );

  const trigger = page.getByRole('combobox', { name: 'Bearstronaut' });
  await expect.element(trigger).toHaveAttribute('data-placeholder');

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).not.toHaveBeenCalled();
  await expect.element(trigger).toHaveAttribute('aria-invalid', 'true');
  await expect.element(page.getByText('Required')).toBeVisible();

  await user.click(trigger);
  await user.click(page.getByRole('option', { name: 'Yuri Grizzlyrin' }));
  await expect.element(trigger).toHaveTextContent('Yuri Grizzlyrin');
  await expect.element(trigger).not.toHaveAttribute('data-placeholder');
  const formElement = trigger.element().closest('form');
  expect(formElement && [...new FormData(formElement)]).toEqual([
    ['bear', 'grizzlyrin'],
  ]);

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bear: 'grizzlyrin' });

  await user.click(page.getByRole('button', { name: 'Reset' }));
  await expect.element(trigger).toHaveAttribute('data-placeholder');
});
