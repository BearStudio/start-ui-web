import { expect, test, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { z } from 'zod';

import { render, screen, setupUser } from '@/tests/utils';

import { FormField, FormFieldController } from '..';
import { FormMocked } from '../form-test-utils';

const zFormSchema = () =>
  z.object({
    lovesBears: z.boolean().refine((val) => val === true, {
      message: 'Please say you love bears.',
    }),
  });

test('should have no a11y violations', async () => {
  const mockedSubmit = vi.fn();

  HTMLCanvasElement.prototype.getContext = vi.fn();

  const { container } = render(
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

  const results = await axe(container);

  expect(results).toHaveNoViolations();
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

  const checkbox = screen.getByRole('checkbox', { name: 'I love bears' });
  expect(checkbox).not.toBeChecked();

  await user.click(checkbox);
  expect(checkbox).toBeChecked();

  await user.click(screen.getByRole('button', { name: 'Submit' }));
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

  const checkbox = screen.getByRole('checkbox', { name: 'I love bears' });
  const label = screen.getByText('I love bears');

  expect(checkbox).not.toBeChecked();

  // Test clicking the label specifically
  await user.click(label);
  expect(checkbox).toBeChecked();

  await user.click(screen.getByRole('button', { name: 'Submit' }));
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

  const checkbox = screen.getByRole('checkbox', { name: 'I love bears' });
  expect(checkbox).toBeChecked();

  await user.click(screen.getByRole('button', { name: 'Submit' }));
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

  const checkbox = screen.getByRole('checkbox', { name: 'I love bears' });
  expect(checkbox).toBeDisabled();
  expect(checkbox).not.toBeChecked();

  await user.click(checkbox);
  expect(checkbox).not.toBeChecked();
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ lovesBears: undefined });
});
