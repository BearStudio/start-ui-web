import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import { page, render, setupUser } from '@/tests/utils';

import { FormField, FormFieldController, FormFieldLabel } from '..';
import { FormMocked } from '../form-test-utils';

const zSchema = () =>
  z.object({ balance: z.number({ error: 'Required' }).min(0) });

test('submits the typed number', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();
  await render(
    <FormMocked
      schema={zSchema()}
      useFormOptions={{ defaultValues: { balance: undefined } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Balance</FormFieldLabel>
          <FormFieldController
            type="number"
            control={form.control}
            name="balance"
          />
        </FormField>
      )}
    </FormMocked>
  );

  const input = page.getByRole('textbox', { name: 'Balance' });
  await user.type(input, '12');
  await user.keyboard('{ArrowUp}');
  await expect.element(input).toHaveValue('13');
  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ balance: 13 });
});

test('shows the error on the input and clears it once valid', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();
  await render(
    <FormMocked schema={zSchema()} onSubmit={mockedSubmit}>
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Balance</FormFieldLabel>
          <FormFieldController
            type="number"
            control={form.control}
            name="balance"
          />
        </FormField>
      )}
    </FormMocked>
  );

  const input = page.getByRole('textbox', { name: 'Balance' });
  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).not.toHaveBeenCalled();
  await expect.element(input).toHaveAttribute('aria-invalid', 'true');
  await expect.element(page.getByText('Required')).toBeVisible();

  await user.type(input, '5');
  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ balance: 5 });
  await expect.element(input).not.toHaveAttribute('aria-invalid');
});

test('stores cents and shows units with inCents', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();
  await render(
    <FormMocked
      schema={zSchema()}
      useFormOptions={{ defaultValues: { balance: 1050 } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Balance</FormFieldLabel>
          <FormFieldController
            type="number"
            control={form.control}
            name="balance"
            inCents
            locale="en"
            format={{ minimumFractionDigits: 2 }}
            step={0.01}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const input = page.getByRole('textbox', { name: 'Balance' });
  await expect.element(input).toHaveValue('10.50');
  await user.clear(input);
  await user.type(input, '2.25{Enter}');
  await user.click(page.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ balance: 225 });
});

test('follows a form reset', async () => {
  const user = setupUser();
  await render(
    <FormMocked
      schema={zSchema()}
      useFormOptions={{ defaultValues: { balance: 3 } }}
    >
      {({ form }) => (
        <>
          <FormField>
            <FormFieldLabel>Balance</FormFieldLabel>
            <FormFieldController
              type="number"
              control={form.control}
              name="balance"
            />
          </FormField>
          <button type="button" onClick={() => form.reset()}>
            Reset
          </button>
        </>
      )}
    </FormMocked>
  );

  const input = page.getByRole('textbox', { name: 'Balance' });
  await user.click(input);
  await user.keyboard('{ArrowUp}{ArrowUp}');
  await expect.element(input).toHaveValue('5');
  await user.click(page.getByRole('button', { name: 'Reset' }));
  await expect.element(input).toHaveValue('3');
});
