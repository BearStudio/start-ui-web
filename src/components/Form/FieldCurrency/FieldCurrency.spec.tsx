import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import { FormMocked } from '@/components/Form/form-test-utils';
import { render, screen, setupUser } from '@/tests/utils';

import { FormField, FormFieldController, FormFieldLabel } from '..';

test('update value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ balance: z.number() })}
      useFormOptions={{ defaultValues: { balance: undefined } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Balance</FormFieldLabel>
          <FormFieldController
            type="currency"
            control={form.control}
            name="balance"
          />
        </FormField>
      )}
    </FormMocked>
  );
  const input = screen.getByLabelText<HTMLInputElement>('Balance');
  await user.type(input, '12.00');
  expect(input.value).toBe('€12.00');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ balance: 12 });
});

test('update value in cents', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ balance: z.number() })}
      useFormOptions={{ defaultValues: { balance: undefined } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Balance</FormFieldLabel>
          <FormFieldController
            type="currency"
            control={form.control}
            name="balance"
            inCents
          />
        </FormField>
      )}
    </FormMocked>
  );
  const input = screen.getByLabelText<HTMLInputElement>('Balance');
  await user.type(input, '12.00');
  expect(input.value).toBe('€12.00');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ balance: 1200 });
});

test('update value locale fr', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ balance: z.number() })}
      useFormOptions={{ defaultValues: { balance: undefined } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Balance</FormFieldLabel>
          <FormFieldController
            type="currency"
            control={form.control}
            name="balance"
            locale="fr"
          />
        </FormField>
      )}
    </FormMocked>
  );
  const input = screen.getByLabelText<HTMLInputElement>('Balance');
  await user.type(input, '12.00');
  expect(input.value).toBe('12,00 €');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ balance: 12 });
});

test('update value no decimals', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ balance: z.number() })}
      useFormOptions={{ defaultValues: { balance: undefined } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Balance</FormFieldLabel>
          <FormFieldController
            type="currency"
            control={form.control}
            name="balance"
            decimals={0}
          />
        </FormField>
      )}
    </FormMocked>
  );
  const input = screen.getByLabelText<HTMLInputElement>('Balance');
  await user.type(input, '12');
  await user.tab();
  expect(input.value).toBe('€12');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ balance: 12 });
});

test('default value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ balance: z.number() })}
      useFormOptions={{ defaultValues: { balance: 12 } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Balance</FormFieldLabel>
          <FormFieldController
            type="currency"
            control={form.control}
            name="balance"
          />
        </FormField>
      )}
    </FormMocked>
  );
  const input = screen.getByLabelText<HTMLInputElement>('Balance');
  expect(input.value).toBe('€12.00');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ balance: 12 });
});

test('disabled', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ balance: z.number() })}
      useFormOptions={{ defaultValues: { balance: 12 } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Balance</FormFieldLabel>
          <FormFieldController
            type="currency"
            control={form.control}
            name="balance"
            isDisabled
          />
        </FormField>
      )}
    </FormMocked>
  );
  const input = screen.getByLabelText<HTMLInputElement>('Balance');
  await user.type(input, '10.00');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ balance: 12 });
});
