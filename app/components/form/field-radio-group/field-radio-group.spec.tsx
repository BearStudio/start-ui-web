import { expect, test, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { z } from 'zod';

import { render, screen, setupUser } from '@/tests/utils';

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
];

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
            type="radio-group"
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

test('should select radio on button click', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ bear: z.string() })}
      useFormOptions={{ defaultValues: { bear: '' } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            type="radio-group"
            control={form.control}
            name="bear"
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const radio = screen.getByRole('radio', { name: 'Buzz Pawdrin' });
  expect(radio).not.toBeChecked();

  await user.click(radio);
  expect(radio).toBeChecked();

  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bear: 'pawdrin' });
});

test('should select radio on label click', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ bear: z.string() })}
      useFormOptions={{ defaultValues: { bear: '' } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            type="radio-group"
            control={form.control}
            name="bear"
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const radio = screen.getByRole('radio', { name: 'Buzz Pawdrin' });
  const label = screen.getByText('Buzz Pawdrin');

  expect(radio).not.toBeChecked();

  // Test clicking the label specifically
  await user.click(label);
  expect(radio).toBeChecked();

  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bear: 'pawdrin' });
});

test('should handle keyboard navigation', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ bear: z.string() })}
      useFormOptions={{ defaultValues: { bear: '' } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            type="radio-group"
            control={form.control}
            name="bear"
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const firstRadio = screen.getByRole('radio', { name: 'Bearstrong' });
  const secondRadio = screen.getByRole('radio', { name: 'Buzz Pawdrin' });
  const thirdRadio = screen.getByRole('radio', { name: 'Yuri Grizzlyrin' });

  await user.tab();
  expect(firstRadio).toHaveFocus();

  await user.keyboard('{ArrowDown}');
  expect(secondRadio).toHaveFocus();
  await user.keyboard(' ');
  expect(secondRadio).toBeChecked();

  await user.keyboard('{ArrowDown}');
  expect(thirdRadio).toHaveFocus();

  await user.keyboard('{ArrowUp}');
  expect(secondRadio).toHaveFocus();
  expect(secondRadio).toBeChecked(); // Second radio should still be checked

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
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            type="radio-group"
            control={form.control}
            name="bear"
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const radio = screen.getByRole('radio', { name: 'Yuri Grizzlyrin' });
  expect(radio).toBeChecked();

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
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            type="radio-group"
            control={form.control}
            name="bear"
            disabled
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const radio = screen.getByRole('radio', { name: 'Buzz Pawdrin' });
  expect(radio).toBeDisabled();

  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bear: undefined });
});

test('disabled option', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();
  render(
    <FormMocked
      schema={z.object({ bear: z.string() })}
      useFormOptions={{
        defaultValues: {
          bear: '',
        },
      }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            type="radio-group"
            control={form.control}
            name="bear"
            options={options}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const disabledRadio = screen.getByRole('radio', { name: 'Mae Jemibear' });
  expect(disabledRadio).toBeDisabled();

  await user.click(disabledRadio);
  expect(disabledRadio).not.toBeChecked();

  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ bear: '' });
});
