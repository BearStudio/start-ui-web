import { expect, test, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { z } from 'zod';

import { render, screen, setupUser, waitFor } from '@/tests/utils';

import { FormField, FormFieldController, FormFieldLabel } from '..';
import { FormMocked } from '../form-test-utils';

const options = [
  {
    value: 'bearstrong',
    label: 'Bearstrong',
  },
  {
    value: 'pawdrin',
    label: 'Buzz Pawdrin',
  },
  {
    value: 'grizzlyrin',
    label: 'Yuri Grizzlyrin',
  },
  {
    value: 'jemibear',
    label: 'Mae Jemibear',
    disabled: true,
  },
  {
    value: 'ridepaw',
    label: 'Sally Ridepaw',
  },
  {
    value: 'michaelpawanderson',
    label: 'Michael Paw Anderson',
  },
] as const;

test('should have no a11y violations', async () => {
  const mockedSubmit = vi.fn();

  HTMLCanvasElement.prototype.getContext = vi.fn();

  const { container } = render(
    <FormMocked
      schema={z.object({ bear: z.string() })}
      useFormOptions={{ defaultValues: { bear: undefined } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            type="select"
            control={form.control}
            name="bear"
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const results = await axe(container);

  expect(results).toHaveNoViolations();
});

test('should open on click', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ bear: z.string() })}
      useFormOptions={{ defaultValues: { bear: '' } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => {
        return (
          <FormField>
            <FormFieldLabel>Bearstronaut</FormFieldLabel>
            <FormFieldController
              type="select"
              control={form.control}
              name="bear"
              options={options}
            />
          </FormField>
        );
      }}
    </FormMocked>
  );

  const option = screen.getByRole('option', {
    hidden: true,
    name: 'Buzz Pawdrin',
  });
  expect(option).not.toBeVisible();

  const input = screen.getByLabelText<HTMLInputElement>('Bearstronaut');
  expect(input).toHaveAttribute('aria-expanded', 'false');
  await user.click(input);

  expect(input).toHaveAttribute('aria-expanded', 'true');
  expect(option).toBeVisible();
});

test('update value using arrows', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ bear: z.string() })}
      useFormOptions={{ defaultValues: { bear: '' } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => {
        return (
          <FormField>
            <FormFieldLabel>Bearstronaut</FormFieldLabel>
            <FormFieldController
              type="select"
              control={form.control}
              name="bear"
              options={options}
            />
          </FormField>
        );
      }}
    </FormMocked>
  );

  const option = screen.getByRole('option', {
    hidden: true,
    name: 'Buzz Pawdrin',
  });
  expect(option).not.toBeVisible();

  const input = screen.getByLabelText<HTMLInputElement>('Bearstronaut');
  expect(input).toBeDefined();
  expect(input.name).toBe('bear');

  await user.click(input);
  await user.keyboard('{ArrowDown}');
  await user.keyboard('{ArrowDown}');
  expect(option).toHaveAttribute('aria-selected', 'true');
  await user.keyboard('{Enter}');
  await waitFor(() => expect(option).not.toBeVisible());
  expect(input.value).toBe('Buzz Pawdrin');

  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bear: 'pawdrin' });
});

test('default value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();
  render(
    <FormMocked
      schema={z.object({ bear: z.string() })}
      useFormOptions={{
        defaultValues: {
          bear: 'grizzlyrin',
        },
      }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bear</FormFieldLabel>
          <FormFieldController
            type="select"
            control={form.control}
            name="bear"
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  // Checking that the default value is selected
  expect(screen.getByText('Yuri Grizzlyrin')).toBeDefined();

  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bear: 'grizzlyrin' });
});

test('disabled', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();
  render(
    <FormMocked
      schema={z.object({ bear: z.string() })}
      useFormOptions={{
        defaultValues: {
          bear: 'pawdrin',
        },
      }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bear</FormFieldLabel>
          <FormFieldController
            type="select"
            control={form.control}
            name="bear"
            disabled
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bear: undefined });
});

test('readOnly', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();
  render(
    <FormMocked
      schema={z.object({ bear: z.string() })}
      useFormOptions={{
        defaultValues: {
          bear: 'grizzlyrin',
        },
      }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            type="select"
            control={form.control}
            name="bear"
            readOnly
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const option = screen.getByRole('option', {
    hidden: true,
    name: 'Buzz Pawdrin',
  });
  expect(option).not.toBeVisible();

  const input = screen.getByLabelText<HTMLInputElement>('Bearstronaut');
  expect(input).toBeDefined();
  expect(input.name).toBe('bear');

  await user.click(input);
  await user.keyboard('{ArrowDown}');
  await user.keyboard('{ArrowDown}');
  await user.keyboard('{Enter}');

  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bear: 'grizzlyrin' });
});
