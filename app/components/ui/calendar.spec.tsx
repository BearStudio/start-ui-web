import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { describe, expect, it, vitest } from 'vitest';

import { Calendar } from './calendar';

vitest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: ExplicitAny) => key }),
}));

describe('Calendar', () => {
  it('should render with previous, next and year selection button by default', () => {
    render(<Calendar />);

    expect(screen.getByLabelText('Go to the Previous Month')).toBeDefined();
    expect(screen.getByLabelText('Go to the Next Month')).toBeDefined();
    expect(
      screen.getByRole('button', { name: dayjs().format('MMMM YYYY') })
    ).toBeDefined();
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
});
