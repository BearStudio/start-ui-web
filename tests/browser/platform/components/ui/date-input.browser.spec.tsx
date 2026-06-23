import { page, setupUser } from '@tests/utils';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { formatDate } from '@/platform/lib/temporal/date-time';

import { DateInput } from '@/platform/components/ui/date-input';

const ManagedDateInput = (props: {
  format: string;
  onChange: (date: Date | null) => void;
}) => {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <>
      <label htmlFor="date-input">Date</label>
      <DateInput
        id="date-input"
        format={props.format}
        value={date}
        onChange={(newDate) => {
          setDate(newDate);
          props.onChange(newDate);
        }}
      />
      <button type="button">Blur target</button>
    </>
  );
};

describe('DateInput', () => {
  it('keeps blur parsing aligned with the configured format', async () => {
    const user = setupUser();

    const expectBlurParsedAsMayTenth = async (inputValue: string) => {
      const onChange = vi.fn();
      const view = await render(
        <ManagedDateInput format="MM/DD" onChange={onChange} />
      );

      const input = page.getByLabelText('Date');
      await expect.element(input).toBeInTheDocument();

      await user.type(input.element() as HTMLInputElement, inputValue);
      await user.click(page.getByRole('button', { name: 'Blur target' }));

      const lastDate = onChange.mock.lastCall?.[0];
      expect(lastDate).toBeInstanceOf(Date);
      expect(formatDate(lastDate, 'DD/MM')).toBe('10/05');

      await view.unmount();
    };

    await expectBlurParsedAsMayTenth('05/10');
    await expectBlurParsedAsMayTenth('0510');
  });
});
