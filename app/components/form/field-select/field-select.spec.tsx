import { expect, test, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { z } from 'zod';

import { FormMocked } from '@/components/form/form-test-utils';

import { render, screen, setupUser } from '@/tests/utils';

import { FormField, FormFieldController, FormFieldLabel } from '..';

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
