import { afterEach, describe, expect, it, vi } from 'vitest';

import { page, render, setupUser } from '@/tests/utils';

import { SearchInput } from './search-input';

const DELAY = 10;

describe('SearchInput', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not call onChange on mount when controlled', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const onChange = vi.fn();
    await render(<SearchInput value="" onChange={onChange} delay={DELAY} />);

    expect(vi.getTimerCount()).toBeGreaterThan(0);
    vi.advanceTimersByTime(DELAY);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should not call onChange on mount when uncontrolled', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const onChange = vi.fn();
    await render(
      <SearchInput defaultValue="initial" onChange={onChange} delay={DELAY} />
    );

    expect(vi.getTimerCount()).toBeGreaterThan(0);
    vi.advanceTimersByTime(DELAY);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should call onChange once with the debounced value', async () => {
    // `expect.element` advances fake timers by its poll interval on each retry,
    // so the debounce must outlast the whole poll timeout to stay pending.
    const LONG_DELAY = 60_000;
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const user = setupUser();
    const onChange = vi.fn();
    await render(
      <SearchInput value="" onChange={onChange} delay={LONG_DELAY} />
    );

    const textbox = page.getByRole('textbox');
    await user.fill(textbox, 'abc');
    await expect.element(textbox).toHaveValue('abc');
    expect(onChange).not.toHaveBeenCalled();

    vi.runOnlyPendingTimers();
    expect(onChange).toHaveBeenCalledExactlyOnceWith('abc');
  });

  it('should call onChange when clearing after a debounced edit', async () => {
    const user = setupUser();
    const onChange = vi.fn();
    await render(<SearchInput value="" onChange={onChange} delay={DELAY} />);

    const textbox = page.getByRole('textbox');
    await user.fill(textbox, 'abc');
    await expect.poll(() => onChange.mock.calls).toEqual([['abc']]);

    await user.keyboard('{Escape}');
    await expect.poll(() => onChange.mock.calls).toEqual([['abc'], ['']]);
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
