import { useEffect, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { SearchInput } from '@/components/ui/search-input';

import { render } from '@/tests/utils';

const input = () => page.getByRole('textbox', { name: 'Search' });

describe('SearchInput', () => {
  it('runs a search still on its way when the input is left, and only then', async () => {
    const onChange = vi.fn();
    await render(
      <>
        <SearchInput
          aria-label="Search"
          value=""
          delay={10_000}
          onChange={onChange}
        />
        <button type="button">After</button>
      </>
    );

    await input().fill('ada');
    await page.getByRole('button', { name: 'After' }).click();
    expect(onChange).toHaveBeenCalledExactlyOnceWith('ada');

    await input().click();
    await page.getByRole('button', { name: 'After' }).click();
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('keeps what was typed since when its last search comes back as its value', async () => {
    const onChange = vi.fn();
    // The parent's setter, to change the value without taking the focus from the input.
    const parent = { setValue: (_value: string) => {} };
    function Harness() {
      const [value, set] = useState('');
      useEffect(() => {
        parent.setValue = set;
      }, []);
      return (
        <>
          <SearchInput
            aria-label="Search"
            value={value}
            delay={300}
            onChange={onChange}
          />
          <output aria-label="Value">{value}</output>
        </>
      );
    }
    await render(<Harness />);

    await input().fill('ab');
    await expect.poll(() => onChange).toHaveBeenLastCalledWith('ab');
    await userEvent.keyboard('c');
    await expect.element(input()).toHaveValue('abc');

    // The parent catches up with the search sent: the text typed since stays.
    parent.setValue('ab');
    await expect
      .element(page.getByRole('status', { name: 'Value' }))
      .toHaveTextContent('ab');
    await expect.element(input()).toHaveValue('abc');

    // Another value, from outside (a reset, Back), replaces it.
    parent.setValue('zed');
    await expect.element(input()).toHaveValue('zed');
  });

  it('sets its clear button off the end of the input', async () => {
    await render(<SearchInput aria-label="Search" defaultValue="ada" />);

    const clear = page.getByRole('button', { name: 'Clear search' });
    await expect.element(clear).toBeVisible();
    expect(getComputedStyle(clear.element()).marginInlineEnd).toBe('2px');
  });

  it('keeps its text on an Escape that ends a composition, and clears it on another', async () => {
    await render(<SearchInput aria-label="Search" defaultValue="ada" />);
    const element = input().element() as HTMLInputElement;
    element.focus();

    element.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        isComposing: true,
        bubbles: true,
      })
    );
    await expect.element(input()).toHaveValue('ada');

    await userEvent.keyboard('{Escape}');
    await expect.element(input()).toHaveValue('');
  });
});
