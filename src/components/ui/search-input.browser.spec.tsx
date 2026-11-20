import { describe, expect, it, vi } from 'vitest';

import { page, render, setupUser } from '@/tests/utils';

import { SearchInput } from './search-input';

const DELAY = 10;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('SearchInput', () => {
  it('should not call onChange on mount when controlled', async () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} delay={DELAY} />);

    await wait(DELAY * 5);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should not call onChange on mount when uncontrolled', async () => {
    const onChange = vi.fn();
    render(
      <SearchInput defaultValue="initial" onChange={onChange} delay={DELAY} />
    );

    await wait(DELAY * 5);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should call onChange once with the debounced value', async () => {
    const user = setupUser();
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} delay={DELAY} />);

    await user.fill(page.getByRole('textbox'), 'abc');

    await expect.poll(() => onChange.mock.calls).toEqual([['abc']]);
  });

  it('should call onChange when the value is cleared', async () => {
    const user = setupUser();
    const onChange = vi.fn();
    render(<SearchInput value="abc" onChange={onChange} delay={DELAY} />);

    await user.click(page.getByRole('textbox'));
    await user.keyboard('{Escape}');

    await expect.poll(() => onChange.mock.calls).toEqual([['']]);
  });
});
