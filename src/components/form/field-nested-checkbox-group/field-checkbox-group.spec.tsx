import { expect, test, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { z } from 'zod';

import { render, screen, setupUser } from '@/tests/utils';

import { FormField, FormFieldController, FormFieldLabel } from '..';
import { FormMocked } from '../form-test-utils';

const options = [
  { value: 'bearstrong', label: 'Bearstrong' },
  { value: 'pawdrin', label: 'Buzz Pawdrin' },
  { value: 'grizzlyrin', label: 'Yuri Grizzlyrin' },
  { value: 'jemibear', label: 'Mae Jemibear', disabled: true },
];

test('should have no a11y violations', async () => {
  const mockedSubmit = vi.fn();
  HTMLCanvasElement.prototype.getContext = vi.fn();

  const { container } = render(
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

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

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

  const checkbox = screen.getByRole('checkbox', { name: 'Buzz Pawdrin' });
  expect(checkbox).not.toBeChecked();

  await user.click(checkbox);
  expect(checkbox).toBeChecked();

  await user.click(screen.getByRole('button', { name: 'Submit' }));
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

  const checkbox = screen.getByRole('checkbox', { name: 'Buzz Pawdrin' });
  const label = screen.getByText('Buzz Pawdrin');

  expect(checkbox).not.toBeChecked();
  await user.click(label);
  expect(checkbox).toBeChecked();

  await user.click(screen.getByRole('button', { name: 'Submit' }));
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

  const cb1 = screen.getByRole('checkbox', { name: 'Bearstrong' });
  const cb2 = screen.getByRole('checkbox', { name: 'Buzz Pawdrin' });

  await user.click(cb1);
  await user.click(cb2);

  expect(cb1).toBeChecked();
  expect(cb2).toBeChecked();

  await user.click(screen.getByRole('button', { name: 'Submit' }));
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

  const cb1 = screen.getByRole('checkbox', { name: 'Bearstrong' });

  await user.tab();
  expect(cb1).toHaveFocus();

  await user.keyboard(' ');
  expect(cb1).toBeChecked();

  await user.click(screen.getByRole('button', { name: 'Submit' }));
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

  const cb = screen.getByRole('checkbox', { name: 'Yuri Grizzlyrin' });
  expect(cb).toBeChecked();

  await user.click(screen.getByRole('button', { name: 'Submit' }));
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

  const cb = screen.getByRole('checkbox', { name: 'Buzz Pawdrin' });
  expect(cb).toBeDisabled();

  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bears: undefined });
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

  const disabledCb = screen.getByRole('checkbox', { name: 'Mae Jemibear' });
  expect(disabledCb).toBeDisabled();

  await user.click(disabledCb);
  expect(disabledCb).not.toBeChecked();

  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bears: [] });
});
