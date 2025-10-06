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

test('should toggle checkbox on click', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ bears: z.array(z.string()) })}
      useFormOptions={{ defaultValues: { bears: [] } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            type="checkbox-group"
            control={form.control}
            name="bears"
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const checkbox = page.getByRole('checkbox', { name: 'Buzz Pawdrin' });
  await expect.element(checkbox).not.toBeChecked();

  await user.click(checkbox);
  await expect.element(checkbox).toBeChecked();

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bears: ['pawdrin'] });
});

test('should toggle checkbox on label click', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ bears: z.array(z.string()) })}
      useFormOptions={{ defaultValues: { bears: [] } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            type="checkbox-group"
            control={form.control}
            name="bears"
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const checkbox = page.getByRole('checkbox', { name: 'Buzz Pawdrin' });
  const label = page.getByText('Buzz Pawdrin');

  await expect.element(checkbox).not.toBeChecked();
  await user.click(label);
  await expect.element(checkbox).toBeChecked();

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bears: ['pawdrin'] });
});

test('should allow selecting multiple checkboxes', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ bears: z.array(z.string()) })}
      useFormOptions={{ defaultValues: { bears: [] } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            type="checkbox-group"
            control={form.control}
            name="bears"
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const cb1 = page.getByRole('checkbox', { name: 'Bearstrong' });
  const cb2 = page.getByRole('checkbox', { name: 'Buzz Pawdrin' });

  await user.click(cb1);
  await user.click(cb2);

  await expect.element(cb1).toBeChecked();
  await expect.element(cb2).toBeChecked();

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({
    bears: ['bearstrong', 'pawdrin'],
  });
});

test('keyboard interaction: toggle with space', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ bears: z.array(z.string()) })}
      useFormOptions={{ defaultValues: { bears: [] } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            type="checkbox-group"
            control={form.control}
            name="bears"
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const cb1 = page.getByRole('checkbox', { name: 'Bearstrong' });

  await user.tab();
  await expect.element(cb1).toHaveFocus();

  await user.keyboard(' ');
  await expect.element(cb1).toBeChecked();

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bears: ['bearstrong'] });
});

test('default values', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ bears: z.array(z.string()) })}
      useFormOptions={{
        defaultValues: { bears: ['grizzlyrin'] },
      }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            type="checkbox-group"
            control={form.control}
            name="bears"
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const cb = page.getByRole('checkbox', { name: 'Yuri Grizzlyrin' });
  await expect.element(cb).toBeChecked();

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bears: ['grizzlyrin'] });
});

test('disabled group', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ bears: z.array(z.string()) })}
      useFormOptions={{
        defaultValues: { bears: ['pawdrin'] },
      }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            type="checkbox-group"
            control={form.control}
            name="bears"
            disabled
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const cb = page.getByRole('checkbox', { name: 'Buzz Pawdrin' });
  await expect.element(cb).toBeDisabled();

  try {
    await user.click(page.getByRole('button', { name: 'Submit' }), {
      timeout: FAILED_CLICK_TIMEOUT_MS,
    });
  } catch {
    expect(mockedSubmit).toHaveBeenCalledWith({ bears: undefined });
  }
});

test('disabled option', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ bears: z.array(z.string()) })}
      useFormOptions={{ defaultValues: { bears: [] } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            type="checkbox-group"
            control={form.control}
            name="bears"
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const disabledCb = page.getByRole('checkbox', { name: 'Mae Jemibear' });
  await expect.element(disabledCb).toBeDisabled();

  try {
    await user.click(disabledCb, { timeout: FAILED_CLICK_TIMEOUT_MS });
  } catch {
    expect(disabledCb).not.toBeChecked();
  }

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bears: [] });
});
