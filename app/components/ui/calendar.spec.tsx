import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { describe, expect, it, vitest } from 'vitest';

import { Calendar } from './calendar';

vitest.mock('react-i18next', () => ({
  // This is a mock, we name it as the hook we want to mock
  // eslint-disable-next-line @eslint-react/hooks-extra/no-unnecessary-use-prefix
  useTranslation: () => ({ t: (key: ExplicitAny) => key }),
}));

describe('Calendar', () => {
  it('should render with previous and next button by default', () => {
    render(<Calendar />);

    expect(screen.getByLabelText('Go to the Previous Month')).toBeDefined();
    expect(screen.getByLabelText('Go to the Next Month')).toBeDefined();
  });

  it('should render without button date when uncontrolled', () => {
    render(<Calendar />);

    // 3 are the previous, next and year select buttons
    expect(screen.getAllByRole('button').length).toBeLessThanOrEqual(3);
  });

  it('should render date buttons when controlled', () => {
    render(
      <Calendar mode="single" selected={new Date()} onSelect={() => {}} />
    );

    // 3 are the previous, next and year select buttons
    expect(screen.getAllByRole('button').length).toBeGreaterThan(3);
  });

  it('should give the selected value on select', () => {
    const onSelect = vitest.fn();

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
    const button = screen.getByLabelText(ariaLabel, { exact: false });
    expect(button).toBeDefined();

    button.click();

    expect(onSelect).toHaveBeenCalledWith(targetDate.startOf('day').toDate());
  });

  it('should be able to select today using aria-label', () => {
    const onSelect = vitest.fn();

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
    const button = screen.getByLabelText('Today', { exact: false });
    expect(button).toBeDefined();

    button.click();

    expect(onSelect).toHaveBeenCalledWith(targetDate.startOf('day').toDate());
  });
});
