import dayjs from 'dayjs';
import * as module from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';

import { page, render } from '@/tests/utils';

import { Calendar } from './calendar';

// https://vitest.dev/guide/browser/#limitations
vi.mock('react-i18next', { spy: true });
vi.mocked(module.useTranslation).mockImplementation(
  // @ts-expect-error We don't bother typing properly for this test
  () => ({ t: (key) => key })
);

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

  it('should render without button date when uncontrolled', () => {
    render(<Calendar />);

    // 3 are the previous, next and year select buttons
    expect(page.getByRole('button').all().length).toBeLessThanOrEqual(3);
  });

  it('should render date buttons when controlled', () => {
    render(
      <Calendar mode="single" selected={new Date()} onSelect={() => {}} />
    );

    // 3 are the previous, next and year select buttons
    expect(page.getByRole('button').all().length).toBeGreaterThan(3);
  });

  it('should give the selected value on select', async () => {
    const onSelect = vi.fn();

    render(
      <Calendar
        mode="single"
        selected={new Date()}
        onSelect={(v) => {
          // Start of day is easier to expect
          onSelect(dayjs(v).startOf('day').toDate());
        }}
      />
    );

    // 12 always exist in a month
    const targetDate = dayjs().set('date', 12);
    const ariaLabel = targetDate.format('dddd, MMMM D');

    // exact false because we don't provide the end of the aria-label (the year mostly)
    const button = page.getByLabelText(ariaLabel, { exact: false });
    await expect.element(button).toBeDefined();

    await button.click();

    expect(onSelect).toHaveBeenCalledWith(targetDate.startOf('day').toDate());
  });

  it('should be able to select today using aria-label', async () => {
    const onSelect = vi.fn();

    render(
      <Calendar
        mode="single"
        selected={dayjs().add(2, 'days').toDate()} // just to make sure that today will be selected
        onSelect={(v) => {
          // Start of day is easier to expect
          onSelect(dayjs(v).startOf('day').toDate());
        }}
      />
    );

    // today
    const targetDate = dayjs();

    // exact false because we don't provide the end of the aria-label
    const button = page.getByLabelText('Today', { exact: false });
    await expect.element(button).toBeDefined();

    await button.click();

    expect(onSelect).toHaveBeenCalledWith(targetDate.startOf('day').toDate());
  });
});
