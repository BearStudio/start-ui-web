import { page, render } from '@tests/utils';
import * as module from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';

import {
  addDaysToDate,
  formatCurrentDate,
  parseStringToDate,
  withDayOfMonth,
} from '@/platform/lib/temporal/date-time';

import { Calendar } from '@/platform/components/ui/calendar';

// https://vitest.dev/guide/browser/#limitations
vi.mock('react-i18next', { spy: true });
vi.mocked(module.useTranslation).mockImplementation(
  () =>
    ({
      t: (key: string) => key,
    }) as ReturnType<typeof module.useTranslation>
);

const formatCalendarAriaDate = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(date);

describe('Calendar', () => {
  it('should render with previous and next button by default', async () => {
    render(<Calendar />);

    await expect
      .element(page.getByLabelText('Go to the Previous Month'))
      .toBeDefined();

    await expect
      .element(page.getByLabelText('Go to the Next Month'))
      .toBeDefined();
  });

  it('should render without button date when uncontrolled', async () => {
    render(<Calendar />);

    await expect
      .element(page.getByLabelText('Go to the Previous Month'))
      .toBeDefined();

    // 3 are the previous, next and year select buttons
    expect(page.getByRole('button').elements().length).toBeLessThanOrEqual(3);
  });

  it('should render date buttons when controlled', async () => {
    render(
      <Calendar mode="single" selected={new Date()} onSelect={() => {}} />
    );

    await expect
      .element(page.getByLabelText('Go to the Previous Month'))
      .toBeDefined();

    // 3 are the previous, next and year select buttons
    expect(page.getByRole('button').elements().length).toBeGreaterThan(3);
  });

  it('should give the selected value on select', async () => {
    const onSelect = vi.fn();

    render(
      <Calendar
        mode="single"
        selected={new Date()}
        onSelect={(v) => {
          onSelect(v);
        }}
      />
    );

    // 12 always exist in a month
    const targetDate = withDayOfMonth(new Date(), 12);
    const ariaLabel = formatCalendarAriaDate(targetDate);

    // exact false because we don't provide the end of the aria-label (the year mostly)
    const button = page.getByLabelText(ariaLabel, { exact: false });
    await expect.element(button).toBeDefined();

    await button.click();

    expect(onSelect).toHaveBeenCalledWith(targetDate);
  });

  it('should be able to select today using aria-label', async () => {
    const onSelect = vi.fn();

    render(
      <Calendar
        mode="single"
        selected={addDaysToDate(new Date(), 2)} // just to make sure that today will be selected
        onSelect={(v) => {
          onSelect(v);
        }}
      />
    );

    // today
    const targetDate = parseStringToDate(formatCurrentDate());

    // exact false because we don't provide the end of the aria-label
    const button = page.getByLabelText('Today', { exact: false });
    await expect.element(button).toBeDefined();

    await button.click();

    expect(onSelect).toHaveBeenCalledWith(targetDate);
  });
});
