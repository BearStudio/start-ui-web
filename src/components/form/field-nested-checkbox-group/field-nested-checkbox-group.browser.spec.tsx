import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import { NestedCheckboxOption } from '@/components/form/field-nested-checkbox-group';

import {
  FAILED_CLICK_TIMEOUT_MS,
  page,
  render,
  setupUser,
} from '@/tests/utils';

import { FormField, FormFieldController, FormFieldLabel } from '..';
import { FormMocked } from '../form-test-utils';

const options: Array<NestedCheckboxOption> = [
  {
    label: 'Astrobears',
    value: 'astrobears',
    children: [
      {
        value: 'bearstrong',
        label: 'Bearstrong',
      },
      {
        value: 'pawdrin',
        label: 'Buzz Pawdrin',
        children: [
          {
            value: 'mini-pawdrin-1',
            label: 'Mini Pawdrin 1',
          },
          {
            value: 'mini-pawdrin-2',
            label: 'Mini Pawdrin 2',
          },
        ],
      },
      {
        value: 'grizzlyrin',
        label: 'Yuri Grizzlyrin',
        disabled: true,
        children: [
          {
            value: 'mini-grizzlyrin-1',
            label: 'Mini Grizzlyrin 1',
          },
          {
            value: 'mini-grizzlyrin-2',
            label: 'Mini Grizzlyrin 2',
          },
        ],
      },
    ],
  },
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
            type="nested-checkbox-group"
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
  expect(mockedSubmit).toHaveBeenCalledWith({
    bears: ['pawdrin', 'mini-pawdrin-1', 'mini-pawdrin-2'],
  });
});

test('should check all non disabled checkboxes', async () => {
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
            type="nested-checkbox-group"
            control={form.control}
            name="bears"
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const checkbox = page.getByRole('checkbox', { name: 'Astrobears' });

  await user.click(checkbox);

  await expect.element(checkbox).toBeChecked();

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({
    bears: [
      'astrobears',
      'bearstrong',
      'pawdrin',
      'mini-pawdrin-1',
      'mini-pawdrin-2',
    ],
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
            type="nested-checkbox-group"
            control={form.control}
            name="bears"
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const cb1 = page.getByRole('checkbox', { name: 'Bearstrong' });

  await user.tab(); // Focus the 'check all' checkbox
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
        defaultValues: {
          bears: ['grizzlyrin', 'mini-grizzlyrin-1', 'mini-grizzlyrin-2'],
        },
      }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            type="nested-checkbox-group"
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
  expect(mockedSubmit).toHaveBeenCalledWith({
    bears: ['grizzlyrin', 'mini-grizzlyrin-1', 'mini-grizzlyrin-2'],
  });
});

test('disabled group', async () => {
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
            type="nested-checkbox-group"
            control={form.control}
            name="bears"
            options={options}
            disabled
          />
        </FormField>
      )}
    </FormMocked>
  );

  const checkAll = page.getByRole('checkbox', { name: 'Astrobears' });
  await expect.element(checkAll).toBeDisabled();

  try {
    await user.click(checkAll, { timeout: FAILED_CLICK_TIMEOUT_MS });
  } catch {
    await expect.element(checkAll).not.toBeChecked();
  }

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bears: undefined });
});

test('disabled option', async () => {
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
            type="nested-checkbox-group"
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
  const subCb1 = page.getByRole('checkbox', { name: 'Mini Pawdrin 1' });
  const subCb2 = page.getByRole('checkbox', { name: 'Mini Pawdrin 2' });
  await expect.element(cb).toBeDisabled();
  await expect.element(subCb1).toBeDisabled();
  await expect.element(subCb2).toBeDisabled();

  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bears: undefined });
});
